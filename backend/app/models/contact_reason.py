from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from typing import Optional, List
from datetime import date

class ContactsReceived(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint("team", "date_pe", "interval_pe", "date_es", "interval_es", name="uq_contacts_received"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    team: str
    date_pe: Optional[date]
    interval_pe: str = Field(max_length=10)
    date_es: Optional[date]
    interval_es: str = Field(max_length=10)
    contacts_received: int = Field(default=0)

    contact_reasons: List["ContactsReason"] = Relationship(back_populates="contacts_received")
    tht_high_by_agent: List["THTHighByAgent"] = Relationship(back_populates="contacts_received")

class ContactsReason(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint("contacts_received_id", "contact_reason", name="uq_contacts_reason"),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
    contacts_received_id: int = Field(foreign_key="contactsreceived.id")
    contact_reason: str
    count: int

    contacts_received: Optional[ContactsReceived] = Relationship(back_populates="contact_reasons")

class THTHighByAgent(SQLModel, table=True):

    __table_args__ = (
        UniqueConstraint("contacts_received_id", "api_email", name="uq_tht_high"),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
    contacts_received_id: int = Field(foreign_key="contactsreceived.id")
    api_email: str
    count: int

    contacts_received: Optional[ContactsReceived] = Relationship(back_populates="tht_high_by_agent")

