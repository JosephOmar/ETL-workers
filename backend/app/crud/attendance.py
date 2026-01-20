from sqlmodel.ext.asyncio.session import AsyncSession
import pandas as pd
from app.core.utils.columns_names import API_EMAIL
from sqlmodel import select, and_, delete, or_
from app.models.worker import Worker
from app.models.schedule import Schedule
from app.models.attendance import Attendance
from datetime import date, timedelta
from sqlalchemy.dialects.postgresql import insert
from collections import defaultdict
from sqlalchemy.exc import InterfaceError
from collections import defaultdict
from datetime import timedelta
from sqlalchemy import and_, or_
from sqlmodel import select

from collections import defaultdict
from sqlmodel import select, and_
from datetime import timedelta

from sqlalchemy.orm import selectinload

EMAIL_BATCH = 500
DOC_BATCH = 500

async def get_workers_and_schedule_for_attendance(
    session: AsyncSession,
    df: pd.DataFrame
):
    enriched_rows = []

    # 1️⃣ Workers por email
    all_emails = (
        df[API_EMAIL]
        .astype(str)
        .str.strip()
        .unique()
        .tolist()
    )

    workers = []
    for i in range(0, len(all_emails), EMAIL_BATCH):
        batch = all_emails[i : i + EMAIL_BATCH]
        result = await session.exec(
            select(Worker).where(Worker.api_email.in_(batch))
        )
        workers.extend(result.all())

    if not workers:
        return []

    worker_map = {w.api_email.strip(): w for w in workers}
    all_docs = list({w.document for w in workers})

    # 2️⃣ Ventana global
    all_event_starts = [
        e["start"]
        for row in df.itertuples(index=False)
        for e in row.events
    ]

    if not all_event_starts:
        return []

    window_start = min(all_event_starts) - timedelta(hours=4)
    window_end   = max(all_event_starts) + timedelta(hours=4)

    # 3️⃣ Schedules + attendances (PRELOAD)
    schedules = []

    for i in range(0, len(all_docs), DOC_BATCH):
        batch = all_docs[i : i + DOC_BATCH]
        result = await session.exec(
            select(Schedule)
            .options(
                selectinload(Schedule.attendances)
            )
            .where(
                and_(
                    Schedule.document.in_(batch),
                    Schedule.start_date_pe <= window_end.date(),
                    Schedule.end_date_pe >= window_start.date(),
                )
            )
        )
        schedules.extend(result.all())

    schedule_map = defaultdict(list)
    for s in schedules:
        schedule_map[s.document].append(s)

    # 4️⃣ Enriquecer
    for row in df.itertuples(index=False):
        api_email = str(row.api_email).strip()
        worker = worker_map.get(api_email)
        if not worker:
            continue

        worker_schedules = schedule_map.get(worker.document)
        if not worker_schedules:
            continue

        enriched_rows.append({
            "api_email": api_email,
            "document": worker.document,
            "events": row.events,
            "schedules": worker_schedules,
        })

    return enriched_rows

CHUNK_SIZE = 500

async def bulk_upsert_attendance_on_conflict(
    session: AsyncSession,
    attendance_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
    total = 0

    for i in range(0, len(attendance_data), chunk_size):
        chunk = attendance_data[i : i + chunk_size]

        stmt = insert(Attendance).values(chunk)

        update_cols = {
            col.name: getattr(stmt.excluded, col.name)
            for col in Attendance.__table__.columns
            if col.name not in ("id", "api_email", "schedule_id")
        }

        stmt = stmt.on_conflict_do_update(
            index_elements=["api_email", "schedule_id"],
            set_=update_cols
        )

        try:
            await session.exec(stmt)
            await session.commit()
            total += len(chunk)
        except InterfaceError:
            await session.rollback()
            raise

    return {"inserted_or_updated": total}