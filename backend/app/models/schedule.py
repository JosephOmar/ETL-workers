from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date, time
from sqlalchemy.orm import Mapped

class Schedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_document: str = Field(foreign_key="worker.document")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    break_start: Optional[time] = None
    break_end: Optional[time] = None
    is_rest_day: bool
    obs: Optional[str] = Field(default=None, max_length=4, nullable=True)

    # Importación dentro de la relación para evitar ciclo
    worker: Mapped["Worker"] = Relationship(back_populates="schedules")
