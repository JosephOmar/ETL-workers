from fastapi import APIRouter, Depends, Query
from datetime import date
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database.database import get_session
from app.reports.attendance.reportAttendanceService import build_adherence_report
from app.reports.attendance.reportAttendanceSchema import AdherenceReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get(
    "/adherence",
    response_model=AdherenceReportResponse
)
async def adherence_report(
    date_from: date = Query(...),
    date_to: date = Query(...),
    team_name: str | None = Query(None),
    coordinator: str | None = Query(None),
    db: AsyncSession = Depends(get_session)
):
    """
    Genera el reporte de adherence.
    - team_name: filtra por nombre de equipo (opcional)
    - coordinator: filtra por coordinador (opcional)
    """
    return await build_adherence_report(
        db=db,
        date_from=date_from,
        date_to=date_to,
        team_name=team_name,
        coordinator=coordinator
    )
