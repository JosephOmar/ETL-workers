// Agent
export interface SlaBreachedAgent {
  api_email?: string;
  name?: string;
  supervisor?: string;
  chat_breached: number;
  links: string[];
}

// Supervisor
export interface SlaBreachedSupervisor {
  supervisor?: string;
  coordinator?: string;
  chat_breached: number;
  links: string[];
}

// Interval
export interface SlaBreachedInterval {
  team: string;
  date_es: string;      // viene como ISO date
  interval_es: string;
  date_pe: string;
  interval_pe: string;

  agents: SlaBreachedAgent[];
  supervisors: SlaBreachedSupervisor[];
}

// Response completa
export interface SlaBreachedReportResponse {
  meta: {
    zone: "PE" | "ES";
    date: string;
  };
  intervals: SlaBreachedInterval[];
}
