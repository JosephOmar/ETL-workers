import localforage from "localforage";
import { create } from "zustand";
import type { THTHighResponse } from "../types/tht-high-agent.type";

export const thtHighAgentStorage = localforage.createInstance({
  name: "ETL-Workers",
  storeName: "tht_high_agent_report_store",
});

interface THTHighAgentState {
  data: THTHighResponse | null;

  loading: boolean;
  error: string | null;

  zone: "PE" | "ES";
  date: string;

  setZone: (zone: "PE" | "ES") => void;
  setDate: (date: string) => void;

  fetchReport: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
  clearReport: () => void;
}

export const useTHTHighAgentStore = create<THTHighAgentState>((set, get) => ({
  data: null,

  loading: false,
  error: null,

  zone: "PE",
  date: new Date().toISOString().slice(0, 10),

  setZone: (zone) => set({ zone }),
  setDate: (date) => set({ date }),

  clearReport: () => set({ data: null }),

  fetchReport: async (forceRefresh = false, silent = false) => {
    if (!silent) set({ loading: true, error: null });

    const { zone, date } = get();
    const cacheKey = `tht_high_${zone}_${date}`;

    try {
      if (!forceRefresh) {
        const cached =
          await thtHighAgentStorage.getItem<THTHighResponse>(cacheKey);

        if (cached) {
          set({ data: cached, loading: false });
          return;
        }
      }

      const params = new URLSearchParams({ zone, date });

      const res = await fetch(
        `${import.meta.env.PUBLIC_URL_BACKEND}reports/tht-high?${params.toString()}`
      );

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data: THTHighResponse = await res.json();

      await thtHighAgentStorage.setItem(cacheKey, data);

      set({ data, loading: false });
    } catch (err: any) {
      set({
        error: err.message ?? "Error inesperado",
        loading: false,
      });
    }
  },
}));
