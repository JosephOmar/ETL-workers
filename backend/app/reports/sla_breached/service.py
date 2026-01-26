from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.reports.sla_breached.crud import get_sla_breached_report

async def fetch_sla_breached_report(
    session: AsyncSession
):
    try:
        return await get_sla_breached_report(session)
    except Exception as e:
        print(f"❌ [SLA REPORT] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal error"
        )
