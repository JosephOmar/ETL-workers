from typing import Dict, List, Optional
from sqlmodel import Session, select
from sqlalchemy.dialects.postgresql import insert
import math
from collections import Counter
import time

from app.models.worker import Role, Status, Campaign, Team, WorkType, ContractType, Worker

def upsert_lookup_table(session: Session, Model, values: List[str]) -> Dict[str, int]:

    unique_values = {v.strip() for v in values if v and isinstance(v, str)}
    if not unique_values:
        return {}

    existing_query = (
        select(Model)
        .where(Model.name.in_(unique_values))
    )
    existing_records = session.exec(existing_query).all()

    result_map = {r.name: r.id for r in existing_records}

    missing_values = unique_values - set(result_map.keys())
    if not missing_values:
        return result_map

    insert_stmt = (
        insert(Model)
        .values([{"name": v} for v in missing_values])
        .on_conflict_do_nothing(index_elements=["name"])
        .returning(Model.id, Model.name)
    )

    new_records = session.exec(insert_stmt).all()
    session.commit()

    for id_, name in new_records:
        result_map[name] = id_

    return result_map


def upsert_worker(session: Session, data: dict) -> Worker:
    """
    Inserta o actualiza un Worker según su `document`.
    Devuelve la instancia gestionada por SQLModel.
    """
    stmt = select(Worker).where(Worker.document == data["document"])
    existing: Optional[Worker] = session.exec(stmt).first()

    if existing:
        # Actualizar sólo los campos que vengan en data
        for key, value in data.items():
            if hasattr(existing, key):
                setattr(existing, key, value)
        worker = existing
    else:
        worker = Worker(**data)
        session.add(worker)

    return worker

def bulk_upsert_workers(session: Session, workers_data: List[Dict]) -> int:

    if not workers_data:
        return 0

    total_processed = 0

    incoming_docs = {w["document"] for w in workers_data}

    existing_workers = {
        w.document: w
        for w in session.exec(
            select(Worker).where(Worker.document.in_(incoming_docs))
        ).all()
    }

    updatable_fields = [
        "name", "role_id", "status_id", "campaign_id", "team_id",
        "manager", "supervisor", "coordinator",
        "work_type_id", "start_date", "termination_date",
        "contract_type_id", "requirement_id",
        "api_id", "api_name", "api_email",
        "observation_1", "observation_2",
        "tenure", "trainee", "productive"
    ]

    workers_to_insert = []
    workers_to_update = []

    for worker in workers_data:
        doc = worker["document"]

        if doc in existing_workers:
            db_worker = existing_workers[doc]
            db_values = tuple(getattr(db_worker, f) for f in updatable_fields)
            incoming_values = tuple(worker.get(f) for f in updatable_fields)

            if db_values != incoming_values:
                workers_to_update.append({
                    "id": db_worker.id,
                    **{f: worker.get(f) for f in updatable_fields}
                })
                total_processed += 1
        else:
            workers_to_insert.append(worker)

    if workers_to_insert:
        session.bulk_insert_mappings(Worker, workers_to_insert)
        total_processed += len(workers_to_insert)

    if workers_to_update:
        session.bulk_update_mappings(Worker, workers_to_update)

    session.commit()

    print(f"✅ Total registros procesados: {total_processed}")
    return total_processed

