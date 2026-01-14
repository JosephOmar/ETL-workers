from fastapi import APIRouter, UploadFile, Depends, File
from sqlmodel import select, text
from sqlalchemy.orm import selectinload, with_loader_criteria
from typing import List

from app.database.database import get_session
from app.services.workers_service import process_and_persist_workers
from app.models.worker import Worker
from app.schemas.worker import WorkerRead
from app.models.schedule import Schedule
from app.models.attendance import Attendance
from datetime import datetime, timedelta, timezone
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter()

@router.post("/upload-workers/")
async def upload_workers(
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session)
):
    count = await process_and_persist_workers(
        files,
        session
    )
    return {"message": f"Se insertaron {count} trabajadores correctamente."}

@router.get(
    "/workers/",
    response_model=List[WorkerRead],
    summary="Lista todos los trabajadores con sus horarios"
)
async def read_workers(session: AsyncSession = Depends(get_session)):

    try:
        peru_tz = timezone(timedelta(hours=-5))
        current_day = datetime.now(peru_tz).date()
        next_day = current_day + timedelta(days=1)
        previous_day = current_day - timedelta(days=1)
        statement = (
            select(Worker)
            .options(
                selectinload(Worker.role),
                selectinload(Worker.status),
                selectinload(Worker.campaign),
                selectinload(Worker.team),
                selectinload(Worker.work_type),
                selectinload(Worker.contract_type),
                selectinload(Worker.schedules),
                selectinload(Worker.attendances),
                with_loader_criteria(
                    Schedule,
                    Schedule.start_date_pe.in_([next_day, current_day, previous_day])),
            )
        )
        result = await session.exec(statement)
        workers = result.all()

        return workers
    except Exception as e:
        print(f"{e} xd")

@router.post("/truncate-workers/")
async def truncate_workers(session: AsyncSession = Depends(get_session)):
    try:
        await session.exec(text("TRUNCATE TABLE worker RESTART IDENTITY CASCADE;"))
        await session.commit()
        return {"message": "Tabla workers truncada correctamente."}

    except Exception as e:
        session.rollback()
        return {"error": str(e)}