from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.contact_reason import ContactsReceived, ContactsReason, THTHighByAgent

CHUNK_SIZE = 1000


async def bulk_upsert_contacts_received(
    session: AsyncSession,
    data: list[dict],
    chunk_size: int = CHUNK_SIZE
):
    if not data:
        return {}

    key_to_id = {}

    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]

        stmt = insert(ContactsReceived).values(chunk)

        stmt = (
            stmt.on_conflict_do_update(
                constraint="uq_contacts_received",
                set_={
                    "contacts_received": func.greatest(
                        ContactsReceived.contacts_received,
                        stmt.excluded.contacts_received
                    )
                }
            )
            .returning(
                ContactsReceived.id,
                ContactsReceived.team,
                ContactsReceived.date_pe,
                ContactsReceived.interval_pe,
                ContactsReceived.date_es,
                ContactsReceived.interval_es,
            )
        )

        result = await session.exec(stmt)

        for row in result:
            key = (
                row.team,
                row.date_pe,
                row.interval_pe,
                row.date_es,
                row.interval_es,
            )
            key_to_id[key] = row.id

    await session.commit()
    return key_to_id

async def bulk_upsert_contacts_reason(
    session: AsyncSession,
    data: list[dict],
    parent_map: dict,
    chunk_size: int = CHUNK_SIZE
):
    if not data:
        return

    enriched = []
    for r in data:
        key = (
            r["team"],
            r["date_pe"],
            r["interval_pe"],
            r["date_es"],
            r["interval_es"],
        )
        parent_id = parent_map.get(key)
        if parent_id:
            enriched.append({
                "contacts_received_id": parent_id,
                "contact_reason": r["contact_reason"],
                "count": r["count"],
            })

    for i in range(0, len(enriched), chunk_size):
        chunk = enriched[i:i + chunk_size]

        stmt = insert(ContactsReason).values(chunk)

        stmt = stmt.on_conflict_do_update(
            constraint="uq_contacts_reason",
            set_={
                "count": func.greatest(
                    ContactsReason.count,
                    stmt.excluded.count
                )
            }
        )

        await session.exec(stmt)

    await session.commit()

async def bulk_upsert_tht_high_by_agent(
    session: AsyncSession,
    data: list[dict],
    parent_map: dict,
    chunk_size: int = CHUNK_SIZE
):
    if not data:
        return

    enriched = []
    for r in data:
        key = (
            r["team"],
            r["date_pe"],
            r["interval_pe"],
            r["date_es"],
            r["interval_es"],
        )
        parent_id = parent_map.get(key)
        if parent_id:
            enriched.append({
                "contacts_received_id": parent_id,
                "api_email": r["api_email"],
                "count": r["count"],
            })

    for i in range(0, len(enriched), chunk_size):
        chunk = enriched[i:i + chunk_size]

        stmt = insert(THTHighByAgent).values(chunk)

        stmt = stmt.on_conflict_do_update(
            constraint="uq_tht_high",
            set_={
                "count": func.greatest(
                    THTHighByAgent.count,
                    stmt.excluded.count
                )
            }
        )

        await session.exec(stmt)

    await session.commit()

async def upsert_contacts_with_ccr(
    session: AsyncSession,
    received_data: list[dict],
    reason_data: list[dict],
    tht_data: list[dict],
):
    # 1️⃣ Padre
    parent_map = await bulk_upsert_contacts_received(
        session=session,
        data=received_data
    )

    # 2️⃣ Hijos
    await bulk_upsert_contacts_reason(
        session=session,
        data=reason_data,
        parent_map=parent_map
    )

    await bulk_upsert_tht_high_by_agent(
        session=session,
        data=tht_data,
        parent_map=parent_map
    )

    return {
        "contacts_received": len(received_data),
        "contact_reason": len(reason_data),
        "tht_high_by_agent": len(tht_data),
    }
