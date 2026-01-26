export interface SlaBreachedReportResponse {
  agent: string;
  supervisor: string;
  coordinator?: string;
  team: string;
  date_es: string;
  interval_es?: string;
  date_pe?: string;
  date: string;
  interval_pe: string;
  chat_breached: number;
  link: string[];
}