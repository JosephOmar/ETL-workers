from typing import List
from sqlalchemy.dialects.postgresql import insert
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import column, delete
from app.models.schedule import Schedule
from app.core.utils.utils_for_date_and_time import calculate_shift_minutes

CHUNK_SIZE = 1000

async def bulk_upsert_schedules_on_conflict(
    session: AsyncSession,
    schedules_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
    processed_days = set()

    for sched in schedules_data:
        document = sched["document"]
        start_date_pe = sched["start_date_pe"]
        start_time_pe = sched["start_time_pe"]
        end_time_pe = sched["end_time_pe"]

        shift_minutes = calculate_shift_minutes(start_time_pe, end_time_pe)

        key = (document, start_date_pe)
        if key in processed_days:
            continue

        processed_days.add(key)

        if shift_minutes <= 60:
            await session.exec(
                delete(Schedule).where(
                    Schedule.document == document,
                    Schedule.start_date_pe == start_date_pe
                )
            )
        else:
            await session.exec(
                delete(Schedule).where(
                    Schedule.document == document,
                    Schedule.start_date_pe == start_date_pe
                )
            )

    for i in range(0, len(schedules_data), chunk_size):
        chunk = schedules_data[i : i + chunk_size]

        stmt = insert(Schedule).values(chunk)

        update_cols = {
            col.name: getattr(stmt.excluded, col.name)
            for col in Schedule.__table__.columns
            if col.name not in (
                "id",
                "document",
                "start_date_pe",
                "start_time_pe",
                "end_time_pe",
            )
        }

        stmt = stmt.on_conflict_do_update(
            index_elements=[
                "document",
                "start_date_pe",
                "start_time_pe",
                "end_time_pe",
            ],
            set_=update_cols
        )

        await session.exec(stmt)

    return {"inserted_or_updated": len(schedules_data)}
