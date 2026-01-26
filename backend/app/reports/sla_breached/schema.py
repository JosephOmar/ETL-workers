from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class SlaBreachedReportResponse(BaseModel):
    agent: Optional[str]
    supervisor: Optional[str]
    coordinator: Optional[str]
    team: Optional[str]

    date_es: date
    interval_es: str
    date_pe: date
    interval_pe: str

    chat_breached: int
    link: Optional[List[str]]
