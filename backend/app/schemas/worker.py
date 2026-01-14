from typing import Optional, List
from datetime import date, time
from sqlmodel import SQLModel, Field
from app.schemas.schedule import ScheduleRead
from app.schemas.attendance import AttendanceRead

class RoleRead(SQLModel):
    name: str

class StatusRead(SQLModel):
    name: str

class CampaignRead(SQLModel):
    name: str

class TeamRead(SQLModel):
    name: str

class WorkTypeRead(SQLModel):
    name: str

class ContractTypeRead(SQLModel):
    name: str

class WorkerRead(SQLModel):
    document: str
    name: str
    role: Optional[RoleRead]
    status: Optional[StatusRead]
    campaign: Optional[CampaignRead]
    team: Optional[TeamRead]
    contract_type: Optional[ContractTypeRead]
    manager: Optional[str]
    supervisor: Optional[str]
    coordinator: Optional[str]
    termination_date: Optional[date]
    requirement_id: Optional[str]
    api_id: Optional[str]
    api_email: Optional[str]
    observation_1: Optional[str]
    observation_2: Optional[str]
    tenure: Optional[int]
    productive: Optional[str]

    schedules: List[ScheduleRead] = Field(default_factory=list)
    attendances: List[AttendanceRead] = Field(default_factory=list)