from fastapi import HTTPException, UploadFile
from typing import List

from app.services.utils.upload_service import handle_file_upload_generic
from app.utils.validate_excel_schedule import validate_excel_schedule, SCHEDULE_MAPPING
from app.core.schedule.merge_schedule import merge_schedule
from app.crud.schedule import bulk_upsert_schedules_on_conflict
from app.services.utils.normalize import normalize_for_db
from sqlmodel.ext.asyncio.session import AsyncSession

async def process_and_persist_schedules(
    files: List[UploadFile],
    session: AsyncSession,
    week: int | None = None,
    year: int | None = None,
) -> dict:
    try:
        print('xd1')
        df = await handle_file_upload_generic(
            files=files,
            validator=validate_excel_schedule,
            keyword_to_slot=SCHEDULE_MAPPING,
            required_slots=list(SCHEDULE_MAPPING.values()),
            post_process=merge_schedule,
        )
        df = normalize_for_db(df)
        schedules_data = df.to_dict(orient="records")
        result = await bulk_upsert_schedules_on_conflict(session, schedules_data)
        await session.commit()

        return result

    except Exception as e:
        print(f"❌ [SCHEDULES] Error inesperado en process_and_persist_schedules: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")