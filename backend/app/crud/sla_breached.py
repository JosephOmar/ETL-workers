from sqlalchemy.dialects.postgresql import insert
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.sla_breached import SlaBreached
from sqlalchemy import case

CHUNK_SIZE = 1000

async def bulk_upsert_sla_breached(
    session: AsyncSession,
    sla_data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
    if not sla_data:
        return {"inserted_or_updated": 0}

    table = SlaBreached.__table__

    for i in range(0, len(sla_data), chunk_size):
        chunk = sla_data[i:i + chunk_size]

        stmt = insert(table).values(chunk)

        stmt = stmt.on_conflict_do_update(
            constraint="uq_sla_breached_key",
            set_={
                "chat_breached": case(
                    (
                        stmt.excluded.chat_breached > table.c.chat_breached,
                        stmt.excluded.chat_breached
                    ),
                    else_=table.c.chat_breached
                ),
                "link": case(
                    (
                        stmt.excluded.chat_breached > table.c.chat_breached,
                        stmt.excluded.link
                    ),
                    else_=table.c.link
                )
            }
        )

        await session.exec(stmt)

    await session.commit()

    return {"inserted_or_updated": len(sla_data)}
