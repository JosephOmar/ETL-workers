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

from collections import defaultdict
from datetime import timedelta
from sqlalchemy import and_, or_
from sqlmodel import select

async def get_workers_and_schedule_for_attendance(
    session: AsyncSession,
    df: pd.DataFrame
):
    enriched_rows = []

    # ---------------------------------------
    # 1️⃣ Obtener workers por email
    # ---------------------------------------
    all_emails = (
        df[API_EMAIL]
        .astype(str)
        .str.strip()
        .unique()
        .tolist()
    )

    result_w = await session.exec(
        select(Worker).where(Worker.api_email.in_(all_emails))
    )
    workers = result_w.all()

    worker_map = {w.api_email.strip(): w for w in workers}
    all_docs = [w.document for w in workers]

    if not all_docs:
        return []

    # ---------------------------------------
    # 2️⃣ Calcular ventana global de eventos
    # ---------------------------------------
    all_event_starts = [
        e["start"]
        for row in df.itertuples(index=False)
        for e in row.events
    ]

    if not all_event_starts:
        return []

    window_start = min(all_event_starts) - timedelta(hours=4)
    window_end   = max(all_event_starts) + timedelta(hours=4)

    # ---------------------------------------
    # 3️⃣ Obtener schedules que intersecten
    # ---------------------------------------
    result_s = await session.exec(
        select(Schedule).where(
            and_(
                Schedule.document.in_(all_docs),
                Schedule.start_date_pe <= window_end.date(),
                Schedule.end_date_pe >= window_start.date(),
            )
        )
    )

    schedules = result_s.all()

    schedule_map = defaultdict(list)
    for s in schedules:
        schedule_map[s.document].append(s)

    for row in df.itertuples(index=False):
        api_email = str(row.api_email).strip()
        worker = worker_map.get(api_email)

        if not worker:
            continue

        worker_schedules = schedule_map.get(worker.document, [])

        if not worker_schedules:
            continue

        enriched_rows.append({
            "api_email": api_email,
            "document": worker.document,
            "events": row.events,
            "schedules": worker_schedules,
        })

    return enriched_rows


CHUNK_SIZE = 1000

async def bulk_upsert_attendance_on_conflict(
    session: AsyncSession,
    attendance_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):

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

        await session.exec(stmt)

    return {"inserted_or_updated": len(attendance_data)}