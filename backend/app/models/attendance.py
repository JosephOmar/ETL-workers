from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date, time
from sqlalchemy.orm import Mapped
from sqlalchemy import UniqueConstraint, Column, ForeignKey
import datetime


class Attendance(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint(
            "api_email",
            "schedule_id",
            name="attendance_schedule_unique"
        ),
    )

    # -----------------------------
    # PK
    # -----------------------------
    id: Optional[int] = Field(default=None, primary_key=True)

    # -----------------------------
    # Relaciones
    # -----------------------------
    schedule_id: int = Field( sa_column=Column( ForeignKey("schedule.id", ondelete="CASCADE"), nullable=False))
    api_email: str = Field(index=True)

    schedule: Mapped["Schedule"] = Relationship(back_populates="attendances")

    # -----------------------------
    # Identidad del día
    # -----------------------------
    date: datetime.date = Field(index=True)

    # -----------------------------
    # Tiempos base (dentro del turno)
    # -----------------------------
    check_in: Optional[time] = None
    check_out: Optional[time] = None

    # -----------------------------
    # Estado de asistencia
    # -----------------------------
    status: str = Field(default="Absent")

    # -----------------------------
    # Tiempos (minutos dentro del turno)
    # -----------------------------
    time_aux_productive: int = Field(default=0)
    time_aux_no_productive: int = Field(default=0)

    # -----------------------------
    # Métricas
    # -----------------------------
    adherence: float = Field(default=0)

    # -----------------------------
    # Flags de comportamiento
    # -----------------------------
    early_login: bool = Field(default=False)
    early_login_minutes: int = Field(default=0)

    late_logout: bool = Field(default=False)
    late_logout_minutes: int = Field(default=0)

    left_early: bool = Field(default=False)
    early_leave_minutes: int = Field(default=0)

    late_login: bool = Field(default=False)
    late_login_minutes: int = Field(default=0)
