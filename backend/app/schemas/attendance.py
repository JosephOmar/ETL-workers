from typing import Optional
from datetime import date, time
from sqlmodel import SQLModel
from pydantic import ConfigDict


class AttendanceRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)
    schedule_id: int
    effective_work_time: int
    api_email: str
    date: date

    # Tiempos base
    check_in: Optional[time]
    check_out: Optional[time]

    # Estado
    status: str

    # Tiempos (minutos)
    time_aux_productive: int
    time_aux_no_productive: int

    # Métrica
    adherence: float
    main_deviation_reason: Optional[str]
    adherence_status: str

    # Flags de comportamiento
    early_login: bool
    early_login_minutes: int

    late_logout: bool
    late_logout_minutes: int

    left_early: bool
    early_leave_minutes: int

    late_login: bool
    late_login_minutes: int