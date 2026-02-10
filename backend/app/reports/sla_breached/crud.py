from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import date
from collections import defaultdict
from zoneinfo import ZoneInfo

from app.models.sla_breached import SlaBreached
from app.models.worker import Worker

peru_tz = ZoneInfo("America/Lima")


async def get_sla_breached_report(
    session: AsyncSession,
    zone: str,
    date_value: date,
):
    # -----------------------------
    # Zona de fecha
    # -----------------------------
    date_column = (
        SlaBreached.date_pe
        if zone == "PE"
        else SlaBreached.date_es
    )

    # -----------------------------
    # Query BASE (SIN aggregates)
    # -----------------------------
    stmt = (
        select(
            SlaBreached.team,
            SlaBreached.date_es,
            SlaBreached.interval_es,
            SlaBreached.date_pe,
            SlaBreached.interval_pe,
            SlaBreached.api_email,
            SlaBreached.chat_breached,
            SlaBreached.link,

            Worker.name,
            Worker.supervisor,
            Worker.coordinator,
        )
        .outerjoin(
            Worker,
            Worker.api_email == SlaBreached.api_email
        )
        .where(date_column == date_value)
    )

    rows = (await session.exec(stmt)).all()

    # -----------------------------
    # Agrupación en memoria
    # -----------------------------
    intervals_map = defaultdict(lambda: {
        "team": None,
        "date_es": None,
        "interval_es": None,
        "date_pe": None,
        "interval_pe": None,
        "agents": {},
        "supervisors": {},
    })

    for r in rows:
        key = (
            r.team,
            r.date_es,
            r.interval_es,
            r.date_pe,
            r.interval_pe,
        )

        block = intervals_map[key]

        # Metadata del intervalo
        block["team"] = r.team
        block["date_es"] = r.date_es
        block["interval_es"] = r.interval_es
        block["date_pe"] = r.date_pe
        block["interval_pe"] = r.interval_pe

        # -----------------------------
        # AGENTES (solo si hay match real)
        # -----------------------------
        if r.api_email and r.name:
            agent = block["agents"].setdefault(
                r.api_email,
                {
                    "api_email": r.api_email,
                    "name": r.name,
                    "supervisor": r.supervisor,
                    "chat_breached": 0,
                    "links": set(),
                }
            )

            agent["chat_breached"] += r.chat_breached or 0

            for l in (r.link or []):
                agent["links"].add(l)

        # -----------------------------
        # SUPERVISORES
        # -----------------------------
        if r.supervisor:
            sup = block["supervisors"].setdefault(
                r.supervisor,
                {
                    "supervisor": r.supervisor,
                    "coordinator": r.coordinator,
                    "chat_breached": 0,
                    "links": set(),
                }
            )

            sup["chat_breached"] += r.chat_breached or 0

            for l in (r.link or []):
                sup["links"].add(l)

    # -----------------------------
    # Normalización + ORDEN
    # -----------------------------
    intervals = []

    for block in intervals_map.values():
        block["agents"] = sorted(
            (
                {
                    **agent,
                    "links": list(agent["links"]),
                }
                for agent in block["agents"].values()
            ),
            key=lambda x: x["chat_breached"],
            reverse=True,
        )

        block["supervisors"] = sorted(
            (
                {
                    **sup,
                    "links": list(sup["links"]),
                }
                for sup in block["supervisors"].values()
            ),
            key=lambda x: x["chat_breached"],
            reverse=True,
        )

        intervals.append(block)

    # -----------------------------
    # Response final
    # -----------------------------
    return {
        "meta": {
            "zone": zone,
            "date": date_value,
        },
        "intervals": intervals,
    }
