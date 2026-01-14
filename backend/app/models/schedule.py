from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date, time
from sqlalchemy.orm import Mapped
from sqlalchemy import UniqueConstraint

class Schedule(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "document",
            "start_date_pe",
            "start_time_pe",
            "end_time_pe",
            name="schedule_unique_key"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    document: str = Field(foreign_key="worker.document")

    start_date_pe: Optional[date] = None
    end_date_pe: Optional[date] = None
    start_time_pe: Optional[time] = None
    end_time_pe: Optional[time] = None

    break_start_date_pe: Optional[date] = None
    break_end_date_pe: Optional[date] = None
    break_start_time_pe: Optional[time] = None
    break_end_time_pe: Optional[time] = None

    start_date_es: Optional[date] = None
    end_date_es: Optional[date] = None
    start_time_es: Optional[time] = None
    end_time_es: Optional[time] = None

    break_start_date_es: Optional[date] = None
    break_end_date_es: Optional[date] = None
    break_start_time_es: Optional[time] = None
    break_end_time_es: Optional[time] = None

    is_rest_day: Optional[bool] = None
    obs: Optional[str] = Field(default=None, max_length=4, nullable=True)

    worker: Mapped["Worker"] = Relationship(back_populates="schedules")
