from sqlmodel.ext.asyncio.session import AsyncSession
import pandas as pd
from app.core.utils.columns_names import API_EMAIL
from sqlmodel import select, and_, delete
from app.models.worker import Worker
from app.models.schedule import Schedule
from app.models.attendance import Attendance
from datetime import date
from sqlalchemy.dialects.postgresql import insert

async def get_workers_and_schedule_for_attendance(
    session: AsyncSession,
    df: pd.DataFrame,
    target_date: date
):

    # await session.exec(delete(Attendance).where(Attendance.date == target_date))
    # await session.commit()

    all_emails = (df[API_EMAIL].astype(str).str.strip().unique().tolist())

    result_w = await session.exec(
        select(Worker).where(Worker.api_email.in_(all_emails))
    )
    workers = result_w.all()
    worker_map = {w.api_email.strip(): w for w in workers}

    all_docs = [w.document for w in workers]

    result_s = await session.exec(select(Schedule).where(
        and_(
            Schedule.start_date_pe == target_date,
            Schedule.document.in_(all_docs)
        ))
    )
    schedules = result_s.all()
    schedule_map = {(s.document, s.start_date_pe): s for s in schedules}

    enriched_rows = []

    for row in df.itertuples(index=False):
        api_email = str(row.api_email).strip()

        worker = worker_map.get(api_email)
        if not worker:
            continue

        schedule = schedule_map.get((worker.document, row.date))

        if not schedule or not schedule.start_time_pe or not schedule.end_time_pe:
            continue

        row_data = row._asdict()
        row_data.update({
            "schedule_start": schedule.start_time_pe,
            "schedule_end": schedule.end_time_pe,
            "break_start": schedule.break_start_time_pe,
            "break_end": schedule.break_end_time_pe,
        })

        enriched_rows.append(row_data)

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
            if col.name not in ("id", "api_email", "date")
        }

        stmt = stmt.on_conflict_do_update(
            index_elements=["api_email", "date"],
            set_=update_cols
        )

        await session.exec(stmt)

    return {"inserted_or_updated": len(attendance_data)}