from fastapi import APIRouter, Depends, Query
from datetime import date
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database.database import get_session
from app.reports.attendance.reportAttendanceService import build_adherence_report
from app.reports.attendance.reportAttendanceSchema import AdherenceReportResponse
from app.reports.sla_breached.schema import SlaBreachedResponse
from app.reports.sla_breached.service import get_sla_breached_report
from app.reports.contact_reason.service import get_contact_reasons
from app.reports.tht_agents.service import get_tht_high_combined
from app.reports.tht_agents.schema import THTHighResponse
from typing import List, Literal

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


@router.get(
    "/sla-breached",
    # response_model=SlaBreachedResponse,
    summary="SLA breached report by team and date"
)
async def sla_breached_report(
    session: AsyncSession = Depends(get_session),
    zone: Literal["PE", "ES"] = Query(...),
    date: date = Query(...),
    start_interval: str | None = Query(
        None,
        description="Intervalo inicial (ej: 00:00)"
    ),
    end_interval: str | None = Query(
        None,
        description="Intervalo final (ej: 05:00)"
    ),
):
    return await get_sla_breached_report(session, zone, date, start_interval, end_interval)

@router.get("/contact-reasons")
async def contact_reasons(
    zone: Literal["PE", "ES"] = Query(..., description="Zona (PE o ES)"),
    date: date = Query(..., description="Fecha a consultar"),
    start_interval: str | None = Query(
        None,
        description="Intervalo inicial (ej: 00:00)"
    ),
    end_interval: str | None = Query(
        None,
        description="Intervalo final (ej: 05:00)"
    ),

    session: AsyncSession = Depends(get_session)
):
    return await get_contact_reasons(
        session=session,
        zone=zone,
        date_value=date,
        start_interval=start_interval,
        end_interval=end_interval,
    )

@router.get("/tht-high", 
            # response_model=THTHighResponse
            )
async def tht_high(
    zone: Literal["PE", "ES"] = Query(...),
    date: date = Query(...),
    session: AsyncSession = Depends(get_session),
    start_interval: str | None = Query(
        None,
        description="Intervalo inicial (ej: 00:00)"
    ),
    end_interval: str | None = Query(
        None,
        description="Intervalo final (ej: 05:00)"
    ),
):
    return await get_tht_high_combined(session, zone, date, start_interval, end_interval)