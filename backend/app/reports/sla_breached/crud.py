from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import date, timedelta, datetime

from app.models.sla_breached import SlaBreached
from app.models.worker import Worker
from zoneinfo import ZoneInfo

peru_tz = ZoneInfo("America/Lima")

async def get_sla_breached_report(
    session: AsyncSession
):
    today_pe = datetime.now(peru_tz).date()
    from_date = today_pe - timedelta(days=5)

    stmt = (
        select(
            Worker.name.label("agent"),
            Worker.supervisor,
            Worker.coordinator,

            SlaBreached.team,
            SlaBreached.date_es,
            SlaBreached.interval_es,
            SlaBreached.date_pe,
            SlaBreached.interval_pe,

            SlaBreached.chat_breached,
            SlaBreached.link,
        )
        .join(
            Worker,
            Worker.api_email == SlaBreached.api_email,
            isouter=True
        )
        .where(
            SlaBreached.date_pe.between(from_date, today_pe)
        )
        .order_by(
            Worker.supervisor.asc(),
            SlaBreached.date_pe.desc(),
            SlaBreached.interval_pe
        )
    )

    result = await session.exec(stmt)
    return result.all()
