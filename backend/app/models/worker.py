from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, time
from sqlalchemy.orm import Mapped
from .schedule import Schedule  # Importa Schedule
from .attendance import Attendance  # Importa Attendance
from sqlalchemy import UniqueConstraint

class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="role")

class Status(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="status")

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="campaign")

class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="team")

class WorkType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="work_type")

class ContractType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    workers: Mapped[List["Worker"]] = Relationship(back_populates="contract_type")

class Worker(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint(
            "document",
            name="workers_unique_key"
        ),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
    document: str = Field(unique=True, max_length=10)
    name: str = Field(max_length=100)
    role_id: Optional[int] = Field(default=None, foreign_key="role.id")
    status_id: Optional[int] = Field(default=None, foreign_key="status.id")
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    team_id: Optional[int] = Field(default=None, foreign_key="team.id")
    manager: str = Field(default=None, max_length=100, nullable=True)
    supervisor: str = Field(default=None, max_length=100, nullable=True)
    coordinator: str = Field(default=None, max_length=100, nullable=True)
    work_type_id: Optional[int] = Field(default=None, foreign_key="worktype.id")
    start_date: Optional[date] = Field(default=None)
    termination_date: Optional[date] = Field(default=None)
    contract_type_id: Optional[int] = Field(default=None, foreign_key="contracttype.id")
    requirement_id: Optional[str] = Field(default=None, max_length=15)
    api_id: Optional[str] = Field(default=None, max_length=40)
    api_name: Optional[str] = Field(default=None, max_length=100)
    api_email: Optional[str] = Field(default=None, unique=True, max_length=100)
    observation_1: Optional[str] = Field(default=None, max_length=100)
    observation_2: Optional[str] = Field(default=None, max_length=100)
    tenure: Optional[int] = Field(default=None)
    trainee: Optional[str] = Field(default=None, max_length=20)
    productive: Optional[str] = Field(default='No')

    role: "Role" = Relationship(back_populates="workers")
    contract_type: "ContractType" = Relationship(back_populates="workers")
    work_type: "WorkType" = Relationship(back_populates="workers")
    team: "Team" = Relationship(back_populates="workers")
    campaign: "Campaign" = Relationship(back_populates="workers")
    status: "Status" = Relationship(back_populates="workers")

    schedules: Mapped[List["Schedule"]] = Relationship(back_populates="worker", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    attendances: Mapped[List["Attendance"]] = Relationship(back_populates="worker")
