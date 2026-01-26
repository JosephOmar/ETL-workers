from sqlalchemy import Column, ARRAY, String, UniqueConstraint
from sqlmodel import SQLModel, Field
from typing import List, Optional
from datetime import date

class SlaBreached(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint(
            "team",
            "date_es",
            "interval_es",
            "api_email",
            name="uq_sla_breached_key"
        ),
    )

    id: int = Field(default=None, primary_key=True)
    team: str
    date_es: Optional[date]
    interval_es: str = Field(max_length=10)
    date_pe: Optional[date]
    interval_pe: str = Field(max_length=10)
    api_email: Optional[str]
    chat_breached: Optional[int] = Field(default=0)

    link: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(ARRAY(String), nullable=True)
    )