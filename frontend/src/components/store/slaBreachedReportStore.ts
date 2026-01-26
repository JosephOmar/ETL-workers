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

  dateFrom: string;
  dateTo: string;
  teamName?: string;
  coordinator?: string;

  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
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

    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),

    teamName: undefined,
    coordinator: undefined,

    setDateFrom: (date) => set({ dateFrom: date }),
    setDateTo: (date) => set({ dateTo: date }),
    setTeamName: (name) => set({ teamName: name }),
    setCoordinator: (name) => set({ coordinator: name }),

    clearReport: () => set({ report: null }),

    fetchReport: async (forceRefresh = false, silent = false) => {
      if (!silent) set({ loading: true, error: null });

      const { dateFrom, dateTo, teamName, coordinator } = get();
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

        const params = new URLSearchParams({
          date_from: dateFrom,
          date_to: dateTo,
        });

        if (teamName) params.append("team_name", teamName);
        if (coordinator) params.append("coordinator", coordinator);

        const res = await fetch(
          `${import.meta.env.PUBLIC_URL_BACKEND}reports/sla-breached?${params.toString()}`
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: SlaBreachedReportResponse[] = await res.json();

        await slaBreachedStorage.setItem(cacheKey, data);
        set({ report: data, loading: false });
      } catch (err: any) {
        set({ error: err.message ?? "Error inesperado", loading: false });
      }
    },
  })
);

