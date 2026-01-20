from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# -----------------------------
# KPI Cards
# -----------------------------

class KPIBlock(BaseModel):
    agents_evaluated: int
    agents_below_90: int
    critical_agents: int
    avg_adherence: float


# -----------------------------
# Chart
# -----------------------------

class PenaltyByStatus(BaseModel):
    adherence_status: str
    avg_penalty_minutes: float

# -----------------------------
# Agent row
# -----------------------------

class AgentAdherenceRow(BaseModel):
    document: str
    name: str
    email: Optional[str]

    team: str
    coordinator: Optional[str]
    supervisor: Optional[str]

    date: date
    adherence: float
    adherence_status: str
    penalty_minutes: int
    main_deviation_reason: Optional[str]

# -----------------------------
# Response
# -----------------------------

class AdherenceReportResponse(BaseModel):
    meta: dict
    kpis: KPIBlock
    charts: dict
    agents: List[AgentAdherenceRow]

# -----------------------------
# Chart blocks
# -----------------------------

class AgentsBelow90ByTeam(BaseModel):
    team: str
    agents_below_90: int
    total_agents: int
    affected_pct: float


class AgentsBelow90ByCoordinator(BaseModel):
    coordinator: str
    agents_below_90: int


class DeviationReasonDonut(BaseModel):
    main_deviation_reason: str
    agents_count: int
