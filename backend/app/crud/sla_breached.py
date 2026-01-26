from sqlalchemy.dialects.postgresql import insert
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.sla_breached import SlaBreached

CHUNK_SIZE = 1000

async def bulk_upsert_sla_breached(
    session: AsyncSession,
    sla_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
    if not sla_data:
        return {"inserted_or_updated": 0}

    for i in range(0, len(sla_data), chunk_size):
        chunk = sla_data[i:i + chunk_size]

        stmt = insert(SlaBreached).values(chunk)

        update_cols = {
            col.name: getattr(stmt.excluded, col.name)
            for col in SlaBreached.__table__.columns
            if col.name not in (
                "id",
                "team",
                "date_es",
                "interval_es",
                "api_email",
            )
        }

        stmt = stmt.on_conflict_do_update(
            constraint="uq_sla_breached_key",
            set_=update_cols
        )

        await session.exec(stmt)

    await session.commit()

    return {"inserted_or_updated": len(sla_data)}
