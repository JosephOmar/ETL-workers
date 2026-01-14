from typing import Optional
from datetime import date, time
from sqlmodel import SQLModel

class AttendanceRead(SQLModel):
    api_email: str
    date: date
    check_in: Optional[time]
    check_out: Optional[time]
    status: str
    time_aux_productive: Optional[int]
    time_aux_non_productive: Optional[int] 
    adherence: Optional[float]
    time_outside_scheduled: Optional[int]