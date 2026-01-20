// storage/adherenceReportStorage.ts
import localforage from "localforage";
import { create } from "zustand";
import type { AdherenceReportResponse } from "../types/adherence-report.type";

export const adherenceReportStorage = localforage.createInstance({
  name: "ETL-Workers",
  storeName: "adherence_report_store",
});

interface AdherenceReportState {
  report: AdherenceReportResponse | null;
  loading: boolean;
  error: string | null;

  dateFrom: string;
  dateTo: string;
  teamName?: string; // <-- CAMBIO: antes era teamId
  coordinator?: string;

  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setTeamName: (name?: string) => void; // <-- CAMBIO
  setCoordinator: (name?: string) => void;

  fetchReport: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
  clearReport: () => void;
}

export const useAdherenceReportStore = create<AdherenceReportState>(
  (set, get) => ({
    report: null,
    loading: false,
    error: null,

    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    teamName: undefined, // <-- CAMBIO
    coordinator: undefined,

    setDateFrom: (date) => set({ dateFrom: date }),
    setDateTo: (date) => set({ dateTo: date }),
    setTeamName: (name) => set({ teamName: name }), // <-- CAMBIO
    setCoordinator: (name) => set({ coordinator: name }),

    clearReport: () => set({ report: null }),

    fetchReport: async (forceRefresh = false, silent = false) => {
      if (!silent) set({ loading: true, error: null });

      const { dateFrom, dateTo, teamName, coordinator } = get(); // <-- CAMBIO
      const cacheKey = "adherence_last";

      try {
        if (!forceRefresh) {
          const cached =
            await adherenceReportStorage.getItem<AdherenceReportResponse>(cacheKey);

          if (cached) {
            set({ report: cached });
            if (!silent) set({ loading: false });
          }
        }

        const params = new URLSearchParams({
          date_from: dateFrom,
          date_to: dateTo,
        });

        if (teamName) params.append("team_name", teamName); // <-- CAMBIO
        if (coordinator) params.append("coordinator", coordinator);

        const res = await fetch(
          `${import.meta.env.PUBLIC_URL_BACKEND}reports/adherence?${params.toString()}`
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        await adherenceReportStorage.setItem(cacheKey, data);
        set({ report: data, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    }
  })
);
