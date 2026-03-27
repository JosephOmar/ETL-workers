from collections import defaultdict
from datetime import date
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import func

from app.models.contact_reason import ContactsReceived, ContactsReason
from app.utils.format_intervals import format_interval_label


async def get_contact_reasons(
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
    # CONDICIONES DINÁMICAS
    # =====================
    conditions = [date_column == date_value]

    if start_interval:
        conditions.append(interval_column >= start_interval)

    if end_interval:
        conditions.append(interval_column <= end_interval)

    # =====================
    # QUERY OPTIMIZADA
    # =====================
    stmt = (
        select(
            ContactsReceived.date_pe,
            ContactsReceived.date_es,
            interval_column.label("interval"),
            ContactsReceived.team,
            ContactsReason.contact_reason,
            func.sum(ContactsReason.count).label("count"),
        )
        .join(
            ContactsReason,
            ContactsReason.contacts_received_id == ContactsReceived.id
        )
        .where(*conditions)
        .group_by(
            ContactsReceived.date_pe,
            ContactsReceived.date_es,
            interval_column,
            ContactsReceived.team,
            ContactsReason.contact_reason,
        )
        .order_by(interval_column, ContactsReceived.team)
    )

    rows = (await session.exec(stmt)).all()

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

    # detectar modo rango
    is_range = start_interval is not None or end_interval is not None

    # =====================
    # 🟣 MODO RANGO (AGREGADO POR TEAM)
    # =====================
    if is_range:
        teams_map = defaultdict(lambda: {
            "interval": format_interval_label(start_interval, end_interval),
            "team": None,
            "reasons": defaultdict(int),
            "total": 0,
        })

        for r in rows:
            meta["date_pe"] = r.date_pe
            meta["date_es"] = r.date_es

            block = teams_map[r.team]
            block["team"] = r.team

            block["reasons"][r.contact_reason] += r.count
            block["total"] += r.count

        # convertir estructura
        intervals = []
        for team, data in teams_map.items():
            reasons_list = [
                {"reason": reason, "count": count}
                for reason, count in data["reasons"].items()
            ]

            intervals.append({
                "interval": data["interval"],
                "team": data["team"],
                "reasons": reasons_list,
                "total": data["total"],
            })

        return {
            "meta": meta,
            "intervals": intervals
        }

    # =====================
    # 🔵 MODO NORMAL (POR INTERVALO)
    # =====================
    intervals_map = defaultdict(lambda: {
        "interval": None,
        "team": None,
        "reasons": [],
        "total": 0,
    })

    for r in rows:
        key = (r.interval, r.team)

        meta["date_pe"] = r.date_pe
        meta["date_es"] = r.date_es

        block = intervals_map[key]
        block["interval"] = r.interval
        block["team"] = r.team

        block["reasons"].append({
            "reason": r.contact_reason,
            "count": r.count,
        })

        block["total"] += r.count

    # fallback
    if meta["date_pe"] is None:
        meta["date_pe"] = date_value

    if meta["date_es"] is None:
        meta["date_es"] = date_value

    return {
        "meta": meta,
        "intervals": list(intervals_map.values())
    }