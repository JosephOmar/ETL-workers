from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import date
from collections import defaultdict
from zoneinfo import ZoneInfo
from typing import Optional

from app.models.sla_breached import SlaBreached
from app.models.worker import Worker
from app.utils.format_intervals import format_interval_label

peru_tz = ZoneInfo("America/Lima")


async def get_sla_breached_report(
    session: AsyncSession,
    zone: str,
    date_value: date,
    start_interval: Optional[str] = None,
    end_interval: Optional[str] = None,
):
    # -----------------------------
    # Columnas dinámicas
    # -----------------------------
    date_column = (
        SlaBreached.date_pe
        if zone == "PE"
        else SlaBreached.date_es
    )

    interval_column = (
        SlaBreached.interval_pe
        if zone == "PE"
        else SlaBreached.interval_es
    )

    # -----------------------------
    # Query BASE
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

    # -----------------------------
    # 🔥 FILTRO POR RANGO
    # -----------------------------
    if start_interval:
        stmt = stmt.where(interval_column >= start_interval)

    if end_interval:
        stmt = stmt.where(interval_column <= end_interval)

    rows = (await session.exec(stmt)).all()

    # -----------------------------
    # 🔥 DETECTAR SI ES RANGO
    # -----------------------------
    is_range = start_interval is not None or end_interval is not None

    # -----------------------------
    # Agrupación en memoria
    # -----------------------------
    intervals_map = defaultdict(lambda: {
        "team": None,
        "interval_label": None,
        "total_breached": 0,
        "agents": {},
        "supervisors": {},
    })

    for r in rows:
        # -----------------------------
        # 🔥 CLAVE DINÁMICA
        # -----------------------------
        if is_range:
            # 👉 Agrupar SOLO por team (acumulado)
            key = r.team

            interval_label = format_interval_label(start_interval, end_interval)
        else:
            # 👉 Agrupar por intervalo (modo normal)
            interval_value = (
                r.interval_pe if zone == "PE" else r.interval_es
            )

            key = (r.team, interval_value)
            interval_label = interval_value

        block = intervals_map[key]

        block["team"] = r.team
        block["interval_label"] = interval_label

        # -----------------------------
        # TOTAL
        # -----------------------------
        breached_value = r.chat_breached or 0
        block["total_breached"] += breached_value

        # -----------------------------
        # AGENTES
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

            agent["chat_breached"] += breached_value

            if r.link:
                for l in r.link:
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

            sup["chat_breached"] += breached_value

            if r.link:
                for l in r.link:
                    sup["links"].add(l)

    # -----------------------------
    # Normalización final
    # -----------------------------
    intervals = []

    for block in intervals_map.values():
        agents_sorted = sorted(
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

        supervisors_sorted = sorted(
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

        intervals.append({
            "interval": block["interval_label"],
            "team": block["team"],
            "total_breached": block["total_breached"],
            "agents": agents_sorted,
            "supervisors": supervisors_sorted,
        })

    # -----------------------------
    # Ordenar (solo si NO es rango)
    # -----------------------------
    if not is_range:
        intervals.sort(key=lambda x: x["interval"])

    # -----------------------------
    # Response final
    # -----------------------------
    return {
        "meta": {
            "zone": zone,
            "date": date_value,
            "start_interval": start_interval,
            "end_interval": end_interval,
            "mode": "range" if is_range else "interval",
        },
        "intervals": intervals,
    }