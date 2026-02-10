// storage/slaBreachedStorage.ts
import localforage from "localforage";
import { create } from "zustand";
import type { SlaBreachedReportResponse } from "../types/sla-breached-report.type";

export const slaBreachedStorage = localforage.createInstance({
  name: "ETL-Workers",
  storeName: "sla_breached_report_store",
});

interface SlaBreachedReportState {
  report: SlaBreachedReportResponse | null;
  loading: boolean;
  error: string | null;

  zone: "PE" | "ES";
  date: string;
  team?: string;
  coordinator?: string;

  setZone: (zone: "PE" | "ES") => void;
  setDate: (date: string) => void;
  setTeam: (name?: string) => void;
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

    team: "Customer Tier1",
    coordinator: undefined,

    setDate: (date) => set({ date }),
    setZone: (zone) => set({ zone }),
    setTeam: (name) => set({ team: name }),
    setCoordinator: (name) => set({ coordinator: name }),

    clearReport: () => set({ report: null }),

    fetchReport: async (forceRefresh = false, silent = false) => {
      if (!silent) set({ loading: true, error: null });

      const { date, zone, team, coordinator } = get();
      const cacheKey = `sla_breached_${zone}_${date}`;

      try {
        if (!forceRefresh) {
          const cached =
            await slaBreachedStorage.getItem<SlaBreachedReportResponse>(cacheKey);

          if (cached) {
            set({ report: cached, loading: false });
            return;
          }
        }

        const params = new URLSearchParams({ zone, date });
        if (team) params.append("team_name", team);
        if (coordinator) params.append("coordinator", coordinator);

        const res = await fetch(
          `${import.meta.env.PUBLIC_URL_BACKEND}reports/sla-breached?${params.toString()}`
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: SlaBreachedReportResponse = await res.json();

        await slaBreachedStorage.setItem(cacheKey, data);
        set({ report: data, loading: false });
      } catch (err: any) {
        set({
          error: err.message ?? "Error inesperado",
          loading: false,
        });
      }
    },
  })
);
