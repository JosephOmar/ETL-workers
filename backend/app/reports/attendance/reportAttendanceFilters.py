from typing import Optional
from sqlalchemy.sql import Select
from app.models.worker import Worker, Team, Role
from app.models.attendance import Attendance
from app.models.schedule import Schedule

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
    return stmt.where(Team.name.in_(ALLOWED_TEAMS_FOR_ADHERENCE))

def apply_worker_filters(
    stmt: Select,
    team_names: Optional[list[str]] = None,
    coordinator: Optional[str] = None,
) -> Select:
    if team_names:
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
    stmt = (
        stmt
        .select_from(Attendance)
        .join(Schedule, Attendance.schedule_id == Schedule.id)
        .join(Worker, Schedule.document == Worker.document)
        .join(Role, Worker.role_id == Role.id)
        .join(Team, Worker.team_id == Team.id)
        .where(
            Attendance.date.between(date_from, date_to),
            Role.name == "Agent"
        )
    )

    stmt = apply_allowed_teams_filter(stmt)
    stmt = apply_worker_filters(stmt, team_names, coordinator)

    return stmt