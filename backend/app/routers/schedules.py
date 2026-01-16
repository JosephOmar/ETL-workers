from fastapi import APIRouter, UploadFile, Depends, File, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from app.database.database import get_session
from app.services.schedule_service import process_and_persist_schedules

router = APIRouter()


@router.post("/upload-schedules/")
async def upload_schedules(
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session)
):
    """
    Sube uno o varios archivos Excel con schedules,
    los procesa y los inserta en la base de datos usando ON CONFLICT.
    """

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un archivo."
        )

    try:
        result = await process_and_persist_schedules(files, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando los horarios: {str(e)}"
        )

    return result