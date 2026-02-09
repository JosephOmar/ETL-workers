from pydantic import BaseModel
from datetime import date

class ContactReasonResponse(BaseModel):
    date_pe: date | None
    interval_pe: str
    date_es: date | None
    interval_es: str
    team: str
    contact_reason: str
    count: int
