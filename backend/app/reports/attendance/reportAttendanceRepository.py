from sqlalchemy import select, func, case
from app.models.attendance import Attendance
from app.models.schedule import Schedule
from app.models.worker import Worker, Team, Role
from app.reports.attendance.reportAttendanceFilters import apply_base_filters

# -----------------------------
# Agents
# -----------------------------
def get_adherence_rows(date_from, date_to, team_names=None, coordinator=None):
    stmt = (
        select(
            Attendance.date,
            Attendance.adherence,
            Attendance.adherence_status,
            Attendance.time_aux_no_productive.label("penalty_minutes"),
            Attendance.main_deviation_reason,
            Worker.document,
            Worker.name,
            Worker.api_email.label("email"),
            Worker.coordinator,
            Worker.supervisor,
            Team.name.label("team"),
        )
        .select_from(Attendance)
    )

    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)


# -----------------------------
# KPI
# -----------------------------
def get_kpi_block(date_from, date_to, team_names=None, coordinator=None):
    stmt = (
        select(
            func.count(func.distinct(Worker.api_email)).label("agents_evaluated"),
            func.count(
                func.distinct(
                    case(
                        ((Attendance.adherence < 90) & (Attendance.time_aux_no_productive > 20) ,Worker.api_email),
                        else_=None
                    )
                )
            ).label("agents_below_90"),
            func.count(
                func.distinct(
                    case(
                        (Attendance.adherence_status == "Critical", Worker.api_email),
                        else_=None
                    )
                )
            ).label("critical_agents"),
            func.coalesce(func.avg(Attendance.adherence), 0).label("avg_adherence"),
        )
        .select_from(Attendance)
    )
    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)


# -----------------------------
# Charts
# -----------------------------
def get_penalty_by_status(date_from, date_to, team_names=None, coordinator=None):
    order_case = case(
        (Attendance.adherence_status == "Critical", 1),
        (Attendance.adherence_status == "High", 2),
        (Attendance.adherence_status == "Medium", 3),
        (Attendance.adherence_status == "Low", 4),
        else_=5,
    )
    stmt = (
        select(
            Attendance.adherence_status,
            func.avg(Attendance.time_aux_no_productive).label("avg_penalty_minutes"),
        )
        .select_from(Attendance)
        .group_by(Attendance.adherence_status)
        .order_by(order_case) 
    )
    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)


def get_agents_below_90_by_team(date_from, date_to, team_names=None, coordinator=None):
    stmt = (
        select(
            Team.name.label("team"),
            func.count(func.distinct(Worker.api_email))
                .filter(Attendance.adherence < 90)
                .filter(Attendance.time_aux_no_productive > 20)
                .label("agents_below_90"),
            func.count(func.distinct(Worker.api_email)).label("total_agents"),
        )
        .select_from(Attendance)
        .group_by(Team.name)
    )
    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)


def get_agents_below_90_by_coordinator(date_from, date_to, team_names=None, coordinator=None):
    stmt = (
        select(
            Worker.coordinator,
            func.count(func.distinct(Worker.api_email)).label("agents_below_90"),
        )
        .select_from(Attendance)
        .where(Attendance.adherence < 90)
        .where(Attendance.time_aux_no_productive > 20)
        .group_by(Worker.coordinator)
    )
    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)


def get_deviation_reason_donut(date_from, date_to, team_names=None, coordinator=None):
    stmt = (
        select(
            Attendance.main_deviation_reason,
            func.count().label("agents_count"),
        )
        .select_from(Attendance)
        .where(
            Attendance.adherence < 90,
            Attendance.time_aux_no_productive > 20,
            Attendance.main_deviation_reason.isnot(None)
        )
        .group_by(Attendance.main_deviation_reason)
    )
    return apply_base_filters(stmt, date_from, date_to, team_names, coordinator)
