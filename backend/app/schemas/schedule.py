from typing import Optional, List
from datetime import date, time
from sqlmodel import SQLModel

class ScheduleRead(SQLModel):
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
