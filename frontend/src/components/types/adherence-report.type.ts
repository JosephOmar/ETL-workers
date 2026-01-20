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

export interface AgentAdherenceRow {
  document: string;
  name: string;
  email?: string;
  team: string;
  coordinator?: string;
  supervisor?: string;
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
    agents_below_90_by_team?: any[];
    agents_below_90_by_coordinator?: any[];
    deviation_reason_donut?: any[];
  };
  agents: AgentAdherenceRow[];
}

export interface KpiParams {
  dateFrom: string
  dateTo: string
  teamId?: number
  coordinator?: string
}