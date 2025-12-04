import pandas as pd
from fastapi import HTTPException, UploadFile
from typing import List
from sqlmodel import Session, select, insert
import traceback

from app.services.utils.upload_service import handle_file_upload_generic
from app.utils.validate_excel_workers import validate_excel_workers, WORKERS_MAPPING
from app.core.workers.merge_workers import generate_workers
from app.crud.workers import upsert_lookup_table, bulk_upsert_workers
from app.models.worker import Role, Status, Campaign, Team, WorkType, ContractType
from datetime import datetime

def safe_date(value):
    if pd.isna(value):
        return None
    if isinstance(value, datetime):
        return value.date()
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None
    
def safe_str(value):
    if pd.isna(value):
        return None

async def process_and_persist_workers(
    files: List[UploadFile],
    session: Session
) -> int:
    try:

        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_workers,
            keyword_to_slot=WORKERS_MAPPING,
            required_slots=list(WORKERS_MAPPING.values()),
            post_process=generate_workers
        )

        role_map = upsert_lookup_table(session, Role, df["role"].tolist())
        status_map = upsert_lookup_table(session, Status, df["status"].tolist())
        campaign_map = upsert_lookup_table(session, Campaign, df["campaign"].tolist())
        team_map = upsert_lookup_table(session, Team, df["team"].tolist())
        worktype_map = upsert_lookup_table(session, WorkType, df["work_type"].tolist())
        contract_map = upsert_lookup_table(session, ContractType, df["contract_type"].tolist())

        workers_data = []
        for row in df.to_dict(orient="records"):

            workers_data.append({
                "document": str(row["document"]),
                "name": row["name"],
                "role_id": role_map.get(row["role"]),
                "status_id": status_map.get(row["status"]),
                "campaign_id": campaign_map.get(row["campaign"]),
                "team_id": team_map.get(row["team"]),
                "manager": row.get("manager"),
                "supervisor": row.get("supervisor"),
                "coordinator": row.get("coordinator"),
                "work_type_id": worktype_map.get(row["work_type"]),
                "start_date": safe_date(row.get("start_date")),
                "termination_date": safe_date(row.get("termination_date")),
                "contract_type_id": contract_map.get(row["contract_type"]),
                "requirement_id": row.get("requirement_id"),
                "api_id": row.get("api_id"),
                "api_name": row.get("api_name"),
                "api_email": safe_str(row.get("api_email")),
                "observation_1": row.get("observation_1"),
                "observation_2": row.get("observation_2"),
                "tenure": row.get("tenure"),
                "trainee": row.get("trainee"),
                "productive": row.get("productive"),
            })

        total_processed = bulk_upsert_workers(session, workers_data)

        return total_processed

    except Exception as e:
        print("❌ Error inesperado en process_and_persist_schedules:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")
