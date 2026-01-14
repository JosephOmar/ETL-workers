from fastapi import APIRouter, UploadFile, Depends, File, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from app.database.database import get_session
from app.services.attendance_service import process_and_persist_attendance

router = APIRouter()


@router.post("/upload-attendances/")
async def upload_attendance(
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session)
):

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar al menos un archivo."
        )

    try:
        result = await process_and_persist_attendance(files, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando la asistencia: {str(e)}"
        )

    return result