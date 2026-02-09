from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import date
import datetime

class THTHighMeta(BaseModel):
    zone: Literal["PE", "ES"]
    date: datetime.date
    date_pe: datetime.date
    date_es: datetime.date


class THTHighIntervalAgents(BaseModel):
    api_email: str
    name: Optional[str]
    supervisor: Optional[str]
    coordinator: Optional[str]
    count: int

class THTHighIntervalSupervisor(BaseModel):
    supervisor: Optional[str]
    coordinator: Optional[str]
    count: int

class THTHighInterval(BaseModel):
    team: str
    interval_pe: str
    interval_es: str
    agents: List[THTHighIntervalAgents]
    supervisors: List[THTHighIntervalSupervisor]


class THTHighResponse(BaseModel):
    meta: THTHighMeta
    intervals: List[THTHighInterval]
