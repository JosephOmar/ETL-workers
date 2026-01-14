from typing import List
from sqlalchemy.dialects.postgresql import insert
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import column
from app.models.schedule import Schedule

CHUNK_SIZE = 1000

async def bulk_upsert_schedules_on_conflict(
    session: AsyncSession,
    schedules_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
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
