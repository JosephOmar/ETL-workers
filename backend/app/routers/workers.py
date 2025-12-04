from fastapi import APIRouter, UploadFile, Depends, File
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload, with_loader_criteria
from typing import List

from app.database.database import get_session
from app.services.workers_service import process_and_persist_workers
from app.models.worker import Worker
from app.schemas.worker import WorkerRead
from app.models.schedule import Schedule
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.post("/upload-workers/")
async def upload_workers(
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session)
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
def read_workers(session: Session = Depends(get_session)):

    try:
        peru_tz = timezone(timedelta(hours=-5))
        current_day = datetime.now(peru_tz).date()
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
                    Schedule.start_date.in_([current_day, previous_day])
                ),
            )
        )
        workers = session.exec(statement).all()

        return workers
    except Exception as e:
        print(e)

