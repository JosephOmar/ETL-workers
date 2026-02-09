from fastapi import APIRouter, UploadFile, Depends, File, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database.database import get_session
from app.services.contact_reason_service import contacts_with_ccr_service

router = APIRouter()


@router.post("/upload-contacts-with-ccr/")
async def upload_contacts_with_ccr(
    files: UploadFile = File(...),
    session: AsyncSession = Depends(get_session)
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="Debes enviar un archivo."
        )

    try:
        result = await contacts_with_ccr_service(
            files=files,
            session=session
        )
        return result

    except HTTPException:
        # 🔁 Re-lanza errores controlados
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando contactos con CCR: {str(e)}"
        )
