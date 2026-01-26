from fastapi import APIRouter, UploadFile, Depends, File, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from app.database.database import get_session
from app.services.sla_breached_service import process_and_persist_sla_breached

router = APIRouter()


@router.post("/upload-sla-breached/")
async def upload_schedules(
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session)
):

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un archivo."
        )

    try:
        result = await process_and_persist_sla_breached(files, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando los casos vencidos: {str(e)}"
        )

    return result