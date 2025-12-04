from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date, time
from sqlalchemy.orm import Mapped

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    api_email: str = Field(foreign_key="worker.api_email")
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: str = Field(default="absent")  
    out_of_adherence: Optional[int] = Field(default=None)
    offline_minutes: Optional[int] = Field(default=None)

    # Importación dentro de la relación para evitar ciclo
    worker: Mapped["Worker"] = Relationship(back_populates="attendances")
