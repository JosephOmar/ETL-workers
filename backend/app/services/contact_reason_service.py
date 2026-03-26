from fastapi import UploadFile, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.utils.upload_service import handle_file_upload_generic
from app.core.views.contact_reason.clean_contact_reason import clean_contact_reason
from app.utils.validate_excel_contact_reason import (
    validate_excel_contact_reason,
    CONTACTS_MAPPING
)
from app.services.utils.normalize import normalize_for_db
import traceback
from app.crud.contact_reason import upsert_contacts_with_ccr


async def contacts_with_ccr_service(
    files: UploadFile,
    session: AsyncSession
):
    try:
        # 1️⃣ Upload + limpieza
        (
            df_contacts_received,
            df_contact_reason,
            df_high_tht_by_agent
        ) = await handle_file_upload_generic(
            files=[files],
            validator=validate_excel_contact_reason,
            keyword_to_slot=CONTACTS_MAPPING,
            required_slots=list(CONTACTS_MAPPING.values()),
            post_process=clean_contact_reason
        )
        print(df_contacts_received)
        print(df_contact_reason)
        print(df_high_tht_by_agent)
        # 2️⃣ Normalización
        df_contacts_received = normalize_for_db(df_contacts_received)
        df_contact_reason = normalize_for_db(df_contact_reason)
        df_high_tht_by_agent = normalize_for_db(df_high_tht_by_agent)

        # 3️⃣ Dicts
        received_data = df_contacts_received.to_dict(orient="records")
        reason_data = df_contact_reason.to_dict(orient="records")
        tht_data = df_high_tht_by_agent.to_dict(orient="records")

        # 4️⃣ UPSERT
        result = await upsert_contacts_with_ccr(
            session=session,
            received_data=received_data,
            reason_data=reason_data,
            tht_data=tht_data,
        )

        return {
            "status": "ok",
            "result": result
        }

    except Exception as e:
        print("❌ Error en contacts_with_ccr_service")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
