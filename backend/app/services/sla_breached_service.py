from fastapi import HTTPException, UploadFile
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession

from app.services.utils.upload_service import handle_file_upload_generic
from app.services.utils.normalize import normalize_for_db
from app.core.views.sla_breached.clean_sla_breached import clean_sla_breached
from app.crud.sla_breached import bulk_upsert_sla_breached
from app.utils.validate_excel_sla_breached import validate_excel_sla_breached, SLA_MAPPING

async def process_and_persist_sla_breached(
    files: List[UploadFile],
    session: AsyncSession,
) -> dict:
    try:
        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_sla_breached,
            keyword_to_slot=SLA_MAPPING,
            required_slots=list(SLA_MAPPING.values()),
            post_process=clean_sla_breached
        )

        df = normalize_for_db(df)

        sla_data = df.to_dict(orient="records")

        result = await bulk_upsert_sla_breached(
            session=session,
            sla_data=sla_data
        )

        return result

    except Exception as e:
        print(f"❌ [SLA BREACHED] Error inesperado: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )
