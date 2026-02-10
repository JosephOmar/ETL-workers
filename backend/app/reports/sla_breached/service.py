from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.reports.sla_breached.crud import get_sla_breached_report
from datetime import date

async def fetch_sla_breached_report(
    session: AsyncSession,
    zone: str,
    date_value: date,
):
    try:
        return await get_sla_breached_report(session, zone, date_value)
    except Exception as e:
        print(f"❌ [SLA REPORT] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal error"
        )
