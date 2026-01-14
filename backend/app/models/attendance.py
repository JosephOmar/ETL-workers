from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date, time
from sqlalchemy.orm import Mapped
from sqlalchemy import UniqueConstraint

class Attendance(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint(
            "api_email",
            "date",
            name="attendance_unique_key"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    api_email: str = Field(foreign_key="worker.api_email")
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: str = Field(default="absent")
    time_aux_productive: Optional[int] = Field(default=None)
    time_aux_non_productive: Optional[int] = Field(default=None)
    adherence: Optional[float] = Field(default=None)
    time_outside_scheduled: Optional[int] = Field(default=None)

    worker: Mapped["Worker"] = Relationship(back_populates="attendances")