from fastapi import HTTPException, UploadFile
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession
import traceback

from app.services.utils.upload_service import handle_file_upload_generic
from app.services.utils.normalize import normalize_for_db
from app.utils.validate_excel_workers import validate_excel_workers, WORKERS_MAPPING
from app.core.workers.merge_workers import generate_workers
from app.crud.workers import upsert_lookup_table, bulk_upsert_workers
from app.models.worker import Role, Status, Campaign, Team, WorkType, ContractType

async def process_and_persist_workers(
    files: List[UploadFile],
    session: AsyncSession
) -> int:
    try:

        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_workers,
            keyword_to_slot=WORKERS_MAPPING,
            required_slots=list(WORKERS_MAPPING.values()),
            post_process=generate_workers
        )

        df = normalize_for_db(df)

        role_map = await upsert_lookup_table(session, Role, df["role"].tolist())
        status_map = await upsert_lookup_table(session, Status, df["status"].tolist())
        campaign_map = await upsert_lookup_table(session, Campaign, df["campaign"].tolist())
        team_map = await upsert_lookup_table(session, Team, df["team"].tolist())
        worktype_map = await upsert_lookup_table(session, WorkType, df["work_type"].tolist())
        contract_map = await upsert_lookup_table(session, ContractType, df["contract_type"].tolist())

        df["role_id"] = df["role"].map(role_map)
        df["status_id"] = df["status"].map(status_map)
        df["campaign_id"] = df["campaign"].map(campaign_map)
        df["team_id"] = df["team"].map(team_map)
        df["work_type_id"] = df["work_type"].map(worktype_map)
        df["contract_type_id"] = df["contract_type"].map(contract_map)

        df = df.drop(columns=["role","status","campaign","team","work_type","contract_type"])

        workers_data = df.to_dict(orient="records")

        total = await bulk_upsert_workers(session, workers_data)

        return total

    except Exception as e:
        print("❌ Error inesperado en process_and_persist_schedules:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")
