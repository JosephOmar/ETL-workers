// types/adherence-report.type.ts

export interface KPIBlock {
  agents_evaluated: number;
  agents_below_90: number;
  critical_agents: number;
  avg_adherence: number;
}

export interface PenaltyByStatus {
  adherence_status: string;
  avg_penalty_minutes: number;
}

export interface AgentsBelow90ByTeam {
  team: string;
  agents_below_90: number;
  total_agents: number,
  affected_pct: number,
}

export interface AgentsBelow90ByCoordinator {
  coordinator: string;
  agents_below_90: number;
}

export interface DeviationReasonDonut {
  main_deviation_reason: string;
  agents_count: number;
}

export interface AgentAdherenceRow {
  document: string;
  name: string;
  email?: string;
  team: string;
  coordinator: string;
  supervisor: string;
  date: string;
  adherence: number;
  adherence_status: string;
  penalty_minutes: number;
  main_deviation_reason?: string;
}

export interface AdherenceReportResponse {
  meta: {
    date_from: string;
    date_to: string;
    total_agents: number;
  };
  kpis: KPIBlock;
  charts: {
    penalty_by_status: PenaltyByStatus[];
    agents_below_90_by_team: AgentsBelow90ByTeam[];
    agents_below_90_by_coordinator: AgentsBelow90ByCoordinator[];
    deviation_reason_donut: DeviationReasonDonut[];
  };
  agents: AgentAdherenceRow[];
}

export interface KpiParams {
  dateFrom: string
  dateTo: string
  teamId?: number
  coordinator?: string
}