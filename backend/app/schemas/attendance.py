from typing import Optional
from datetime import date, time
from sqlmodel import SQLModel

class AttendanceRead(SQLModel):
    id: int
    api_email: str
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    status: str
    out_of_adherence: Optional[float] = None
    offline_minutes: Optional[float] = None