from collections import defaultdict
from datetime import date
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import func

from app.models.contact_reason import ContactsReceived, THTHighByAgent
from app.models.worker import Worker


async def get_tht_high_combined(
    session: AsyncSession,
    zone: str,
    date_value: date,
    start_interval: str | None = None,
    end_interval: str | None = None,
):
    # =====================
    # COLUMNAS DINÁMICAS
    # =====================
    date_column = (
        ContactsReceived.date_pe
        if zone == "PE"
        else ContactsReceived.date_es
    )

    interval_column = (
        ContactsReceived.interval_pe
        if zone == "PE"
        else ContactsReceived.interval_es
    )

    # =====================
    # CONDICIONES
    # =====================
    conditions = [date_column == date_value]

    if start_interval:
        conditions.append(interval_column >= start_interval)

    if end_interval:
        conditions.append(interval_column <= end_interval)

    # =====================
    # AGENTES
    # =====================
    stmt_agents = (
        select(
            ContactsReceived.date_pe,
            ContactsReceived.date_es,
            ContactsReceived.interval_pe,
            ContactsReceived.interval_es,
            ContactsReceived.team,

            THTHighByAgent.api_email,
            THTHighByAgent.count,

            Worker.name,
            Worker.supervisor,
            Worker.coordinator,
        )
        .join(
            THTHighByAgent,
            THTHighByAgent.contacts_received_id == ContactsReceived.id
        )
        .outerjoin(
            Worker,
            Worker.api_email == THTHighByAgent.api_email
        )
        .where(*conditions)
    )

    agents_rows = (await session.exec(stmt_agents)).all()

    # =====================
    # SUPERVISORES
    # =====================
    stmt_supervisors = (
        select(
            ContactsReceived.date_pe,
            ContactsReceived.date_es,
            ContactsReceived.interval_pe,
            ContactsReceived.interval_es,
            ContactsReceived.team,

            Worker.supervisor,
            Worker.coordinator,
            func.sum(THTHighByAgent.count).label("count"),
        )
        .join(
            THTHighByAgent,
            THTHighByAgent.contacts_received_id == ContactsReceived.id
        )
        .outerjoin(
            Worker,
            Worker.api_email == THTHighByAgent.api_email
        )
        .where(*conditions)
        .group_by(
            ContactsReceived.date_pe,
            ContactsReceived.date_es,
            ContactsReceived.interval_pe,
            ContactsReceived.interval_es,
            ContactsReceived.team,
            Worker.supervisor,
            Worker.coordinator,
        )
    )

    supervisors_rows = (await session.exec(stmt_supervisors)).all()

    # =====================
    # META
    # =====================
    meta = {
        "zone": zone,
        "date": date_value,
        "date_pe": None,
        "date_es": None,
        "start_interval": start_interval,
        "end_interval": end_interval,
    }

    is_range = start_interval is not None or end_interval is not None

    # =====================
    # 🟣 MODO RANGO (AGREGADO POR TEAM)
    # =====================
    if is_range:
        teams_map = defaultdict(lambda: {
            "team": None,
            "interval": f"{start_interval or '00:00'} - {end_interval or '23:59'}",
            "agents": defaultdict(lambda: {
                "api_email": None,
                "name": None,
                "supervisor": None,
                "coordinator": None,
                "count": 0,
            }),
            "supervisors": defaultdict(lambda: {
                "supervisor": None,
                "coordinator": None,
                "count": 0,
            }),
        })

        # AGENTES
        for r in agents_rows:
            meta["date_pe"] = r.date_pe
            meta["date_es"] = r.date_es

            team_block = teams_map[r.team]
            team_block["team"] = r.team

            agent = team_block["agents"][r.api_email]
            agent["api_email"] = r.api_email
            agent["name"] = r.name
            agent["supervisor"] = r.supervisor
            agent["coordinator"] = r.coordinator
            agent["count"] += r.count

        # SUPERVISORES
        for r in supervisors_rows:
            team_block = teams_map[r.team]

            sup_key = (r.supervisor, r.coordinator)
            supervisor = team_block["supervisors"][sup_key]

            supervisor["supervisor"] = r.supervisor
            supervisor["coordinator"] = r.coordinator
            supervisor["count"] += r.count

        # transformar salida
        intervals = []
        for team, data in teams_map.items():
            intervals.append({
                "team": data["team"],
                "interval_pe": data["interval"] if zone == "PE" else None,
                "interval_es": data["interval"] if zone == "ES" else None,
                "agents": list(data["agents"].values()),
                "supervisors": list(data["supervisors"].values()),
            })

        return {
            "meta": meta,
            "intervals": intervals
        }

    # =====================
    # 🔵 MODO NORMAL (ORIGINAL)
    # =====================
    intervals_map = defaultdict(lambda: {
        "team": None,
        "interval_pe": None,
        "interval_es": None,
        "agents": [],
        "supervisors": [],
    })

    # AGENTES
    for r in agents_rows:
        key = (r.interval_pe, r.interval_es, r.team)

        meta["date_pe"] = r.date_pe
        meta["date_es"] = r.date_es

        block = intervals_map[key]
        block["team"] = key[2]
        block["interval_pe"] = key[0]
        block["interval_es"] = key[1]

        block["agents"].append({
            "api_email": r.api_email,
            "name": r.name,
            "supervisor": r.supervisor,
            "coordinator": r.coordinator,
            "count": r.count,
        })

    # SUPERVISORES
    for r in supervisors_rows:
        key = (r.interval_pe, r.interval_es, r.team)

        block = intervals_map[key]
        block["team"] = key[2]
        block["interval_pe"] = key[0]
        block["interval_es"] = key[1]

        block["supervisors"].append({
            "supervisor": r.supervisor,
            "coordinator": r.coordinator,
            "count": r.count,
        })

    # fallback
    if meta["date_pe"] is None:
        meta["date_pe"] = date_value

    if meta["date_es"] is None:
        meta["date_es"] = date_value

    return {
        "meta": meta,
        "intervals": list(intervals_map.values())
    }