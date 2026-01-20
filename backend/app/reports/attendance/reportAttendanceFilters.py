from typing import Optional
from sqlalchemy.sql import Select
from app.models.worker import Worker, Team
from app.models.attendance import Attendance

# Equipos válidos para el reporte
ALLOWED_TEAMS_FOR_ADHERENCE = [
    "Customer Tier1",
    "Customer Tier2",
    "Rider Tier1",
    "Rider Tier2",
    "Vendor Tier1",
    "Vendor Tier2",
    "Vendor Chat",
]

def apply_allowed_teams_filter(stmt: Select) -> Select:
    """Filtro obligatorio: solo equipos válidos para adherence"""
    return stmt.where(Team.name.in_(ALLOWED_TEAMS_FOR_ADHERENCE))

def apply_worker_filters(
    stmt: Select,
    team_names: Optional[list[str]] = None,
    coordinator: Optional[str] = None,
) -> Select:
    """Filtra por nombres de equipo y/o coordinador"""
    if team_names:
        # Si solo envías un string, convertir a lista
        if isinstance(team_names, str):
            team_names = [team_names]
        stmt = stmt.where(Team.name.in_(team_names))

    if coordinator:
        stmt = stmt.where(Worker.coordinator == coordinator)

    return stmt

def apply_base_filters(
    stmt: Select,
    date_from,
    date_to,
    team_names=None,
    coordinator=None
) -> Select:
    stmt = stmt.where(Attendance.date.between(date_from, date_to))
    stmt = apply_allowed_teams_filter(stmt)
    stmt = apply_worker_filters(stmt, team_names, coordinator)
    return stmt
