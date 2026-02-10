from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import date
import datetime
class SlaBreachedAgent(BaseModel):
    api_email: Optional[str]
    name: Optional[str]
    supervisor: Optional[str]
    chat_breached: int
    links: List[str]


class SlaBreachedSupervisor(BaseModel):
    supervisor: Optional[str]
    coordinator: Optional[str]
    chat_breached: int
    links: List[str]


class SlaBreachedInterval(BaseModel):
    team: str
    date_es: date
    interval_es: str
    date_pe: date
    interval_pe: str

    agents: List[SlaBreachedAgent]
    supervisors: List[SlaBreachedSupervisor]


class SlaBreachedResponse(BaseModel):
    meta: dict
    intervals: List[SlaBreachedInterval]
