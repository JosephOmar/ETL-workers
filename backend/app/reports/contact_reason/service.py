from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.contact_reason import ContactsReceived, ContactsReason
from app.reports.contact_reason.schema import ContactReasonResponse


async def get_contact_reasons(
    session: AsyncSession,
    # date_from,
    # date_to
):
    stmt = (
        select(
            ContactsReceived.date_pe,
            ContactsReceived.interval_pe,
            ContactsReceived.date_es,
            ContactsReceived.interval_es,
            ContactsReceived.team,
            ContactsReason.contact_reason,
            ContactsReason.count,
        )
        .join(ContactsReason,
              ContactsReason.contacts_received_id == ContactsReceived.id)
        # .where(ContactsReceived.date_pe.between(date_from, date_to))
        .order_by(
            ContactsReceived.date_pe,
            ContactsReceived.interval_pe,
            ContactsReceived.team
        )
    )

    result = await session.exec(stmt)

    return [
        ContactReasonResponse(
            date_pe=row.date_pe,
            interval_pe=row.interval_pe,
            date_es=row.date_es,
            interval_es=row.interval_es,
            team=row.team,
            contact_reason=row.contact_reason,
            count=row.count,
        )
        for row in result
    ]
