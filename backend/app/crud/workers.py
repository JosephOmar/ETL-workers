from typing import Dict, List, Optional
from sqlmodel import select
from sqlalchemy.dialects.postgresql import insert
import math
from collections import Counter
import time

from app.models.worker import Role, Status, Campaign, Team, WorkType, ContractType, Worker
from sqlmodel.ext.asyncio.session import AsyncSession

async def upsert_lookup_table(session: AsyncSession, Model, values: List[str]) -> Dict[str, int]:

    unique_values = list({v for v in values if v})

    stmt_select = select(Model).where(Model.name.in_(unique_values))
    existing = (await session.exec(stmt_select)).all()

    existing_map = {item.name: item.id for item in existing}

    new_values = [
        {"name": v}
        for v in unique_values
        if v not in existing_map
    ]

    if new_values:
        stmt_insert = insert(Model).values(new_values).returning(Model.id, Model.name)
        result = await session.exec(stmt_insert)
        inserted = result.fetchall()
        for _id, name in inserted:
            existing_map[name] = _id

    return existing_map

async def bulk_upsert_workers(session: AsyncSession, workers_data: List[Dict]) -> int:

    if not workers_data:
        return 0

    stmt = insert(Worker).values(workers_data)

    update_columns = {col.name: getattr(stmt.excluded, col.name) for col in Worker.__table__.columns if col.name not in ("id", "document")}

    stmt = stmt.on_conflict_do_update(
        index_elements=["document"],
        set_=update_columns
    )

    await session.exec(stmt)
    await session.commit()

    return {"inserted_or_updated": len(workers_data)}

