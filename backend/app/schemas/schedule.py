from typing import Optional, List
from datetime import date, time
from sqlmodel import SQLModel, Field
from pydantic import ConfigDict
from app.schemas.attendance import AttendanceRead
class ScheduleRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    start_date_pe:  Optional[date]
    end_date_pe:    Optional[date]
    start_time_pe:  Optional[time]
    end_time_pe:    Optional[time]
    break_start_date_pe:  Optional[date]
    break_end_date_pe:    Optional[date]
    break_start_time_pe: Optional[time]
    break_end_time_pe:   Optional[time]
    start_date_es:  Optional[date]
    end_date_es:    Optional[date]
    start_time_es:  Optional[time]
    end_time_es:    Optional[time]
    break_start_date_es:  Optional[date]
    break_end_date_es:    Optional[date]
    break_start_time_es: Optional[time]
    break_end_time_es:   Optional[time]
    is_rest_day: Optional[bool]
    obs:         Optional[str]

    attendances: List[AttendanceRead] = Field(default_factory=list)