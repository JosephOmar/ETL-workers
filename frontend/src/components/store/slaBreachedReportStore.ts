// storage/slaBreachedStorage.ts
import localforage from "localforage";
import { create } from "zustand";
import type { SlaBreachedReportResponse } from "../types/sla-breached-report.type";

export const slaBreachedStorage = localforage.createInstance({
  name: "ETL-Workers",
  storeName: "sla_breached_report_store",
});

interface SlaBreachedReportState {
  report: SlaBreachedReportResponse[] | null;
  loading: boolean;
  error: string | null;

  zone: "PE" | "ES";
  date: string;
  teamName?: string;
  coordinator?: string;

  setZone: (zone: "PE" | "ES") => void;
  setDate: (date: string) => void
  setTeamName: (name?: string) => void;
  setCoordinator: (name?: string) => void;

  fetchReport: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
  clearReport: () => void;
}

export const useSlaBreachedReportStore = create<SlaBreachedReportState>(
  (set, get) => ({
    report: null,
    loading: false,
    error: null,

    date: new Date().toISOString().slice(0, 10),
    zone: "PE",

    teamName: undefined,
    coordinator: undefined,

    setDate: (date) => set({ date: date }),
    setZone: (zone) => set({ zone }),
    setTeamName: (name) => set({ teamName: name }),
    setCoordinator: (name) => set({ coordinator: name }),

    clearReport: () => set({ report: null }),

    fetchReport: async (forceRefresh = false, silent = false) => {
      if (!silent) set({ loading: true, error: null });

      const { date, zone, teamName, coordinator } = get();
      const cacheKey = "sla_breached_last";

      try {
        if (!forceRefresh) {
          const cached =
            await slaBreachedStorage.getItem<SlaBreachedReportResponse[]>(cacheKey);

          if (cached) {
            set({ report: cached });
            if (!silent) set({ loading: false });
            return;
          }
        }

        const params = new URLSearchParams({zone, date});

        if (teamName) params.append("team_name", teamName);
        if (coordinator) params.append("coordinator", coordinator);

        const res = await fetch(
          `${import.meta.env.PUBLIC_URL_BACKEND}reports/sla-breached?${params.toString()}`
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: SlaBreachedReportResponse[] = await res.json();

        if (data.length > 0) {
          await slaBreachedStorage.removeItem(cacheKey);
          await slaBreachedStorage.setItem(cacheKey, data);
        }
        set({ report: data, loading: false });
      } catch (err: any) {
        set({ error: err.message ?? "Error inesperado", loading: false });
      }
    },
  })
);

