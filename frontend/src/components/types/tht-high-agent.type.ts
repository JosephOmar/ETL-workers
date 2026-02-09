// ======================
// META
// ======================
export interface THTHighMeta {
  zone: "PE" | "ES";
  date: string;
  date_pe: string;
  date_es: string;
}

// ======================
// AGENTES
// ======================
export interface THTHighIntervalAgent {
  api_email: string;
  name: string | null;
  supervisor: string | null;
  coordinator: string | null;
  count: number;
}

// ======================
// SUPERVISORES
// ======================
export interface THTHighIntervalSupervisor {
  supervisor: string | null;
  coordinator: string | null;
  count: number;
}

// ======================
// INTERVALOS
// ======================
export interface THTHighInterval {
  team: string;
  interval_pe: string;
  interval_es: string;
  agents: THTHighIntervalAgent[];
  supervisors: THTHighIntervalSupervisor[];
}

// ======================
// RESPONSE FINAL
// ======================
export interface THTHighResponse {
  meta: THTHighMeta;
  intervals: THTHighInterval[];
}
