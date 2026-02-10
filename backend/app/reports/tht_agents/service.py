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
):
    # =====================
    # COLUMNA DE FECHA SEGÚN ZONA
    # =====================
    date_column = (
        ContactsReceived.date_pe
        if zone == "PE"
        else ContactsReceived.date_es
    )

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
        .where(date_column == date_value)
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
        .where(date_column == date_value)
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
    # NORMALIZACIÓN POR INTERVALO + TEAM
    # =====================
    intervals_map = defaultdict(lambda: {
        "team": None,
        "interval_pe": None,
        "interval_es": None,
        "agents": [],
        "supervisors": [],
    })

    meta = {
        "zone": zone,
        "date": date_value,
        "date_pe": date_value if zone == "PE" else None,
        "date_es": date_value if zone == "ES" else None,
    }


    # =====================
    # AGENTES → MAP
    # =====================
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

    # =====================
    # SUPERVISORES → MAP
    # =====================
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

    if meta["date_pe"] is None:
        meta["date_pe"] = date_value

    if meta["date_es"] is None:
        meta["date_es"] = date_value
    # =====================
    # RESPONSE FINAL
    # =====================
    return {
        "meta": meta,
        "intervals": list(intervals_map.values())
    }
