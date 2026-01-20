from sqlmodel.ext.asyncio.session import AsyncSession
from app.reports.attendance.reportAttendanceRepository import (
    get_adherence_rows,
    get_kpi_block,
    get_penalty_by_status,
    get_agents_below_90_by_coordinator,
    get_agents_below_90_by_team,
    get_deviation_reason_donut
)

async def build_adherence_report(
    db: AsyncSession,
    date_from,
    date_to,
    team_name=None,
    coordinator=None
):
    # ---------- Agents ----------
    rows = (await db.exec(
        get_adherence_rows(date_from, date_to, team_name, coordinator)
    )).all()

    # ---------- KPIs ----------
    kpis = (await db.exec(
        get_kpi_block(date_from, date_to, team_name, coordinator)
    )).one()

    # ---------- Charts ----------
    penalty_by_status = (await db.exec(
        get_penalty_by_status(date_from, date_to, team_name, coordinator)
    )).all()

    by_team_raw = (await db.exec(
        get_agents_below_90_by_team(date_from, date_to, team_name, coordinator)
    )).all()

    by_coordinator = (await db.exec(
        get_agents_below_90_by_coordinator(date_from, date_to, team_name, coordinator)
    )).all()

    deviation_donut = (await db.exec(
        get_deviation_reason_donut(date_from, date_to, team_name, coordinator)
    )).all()

    # ---------- Post-processing ----------
    agents_by_team = []
    for r in by_team_raw:
        pct = (
            (r.agents_below_90 / r.total_agents) * 100
            if r.total_agents else 0
        )
        agents_by_team.append({
            "team": r.team,
            "agents_below_90": r.agents_below_90,
            "total_agents": r.total_agents,
            "affected_pct": round(pct, 2)
        })

    return {
        "meta": {
            "date_from": date_from,
            "date_to": date_to,
            "total_agents": len({r.email for r in rows}),
        },
        "kpis": dict(kpis._mapping),
        "charts": {
            "penalty_by_status": [dict(c._mapping) for c in penalty_by_status],
            "agents_below_90_by_team": agents_by_team,
            "agents_below_90_by_coordinator": [dict(c._mapping) for c in by_coordinator],
            "deviation_reason_donut": [dict(d._mapping) for d in deviation_donut]
        },
        "agents": [dict(r._mapping) for r in rows]
    }
