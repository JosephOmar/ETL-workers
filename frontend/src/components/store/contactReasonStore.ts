import localforage from "localforage";
import { create } from "zustand";
import type { ContactReasonResponse } from "../types/contact-reason.type";

export const contactReasonStorage = localforage.createInstance({
  name: "ETL-Workers",
  storeName: "contact_reason_report_store",
});

interface ContactReasonState {
  report: ContactReasonResponse[] | null;
  loading: boolean;
  error: string | null;

  teamName?: string;

  setTeamName: (name?: string) => void;

  fetchReport: (forceRefresh?: boolean, silent?: boolean) => Promise<void>;
  clearReport: () => void;
}

export const useContactReasonStore = create<ContactReasonState>(
  (set, get) => ({
    report: null,
    loading: false,
    error: null,

    teamName: undefined,

    setTeamName: (name) => set({ teamName: name }),

    clearReport: () => set({ report: null }),

    fetchReport: async (forceRefresh = false, silent = false) => {
      if (!silent) set({ loading: true, error: null });

      const { teamName } = get();
      const cacheKey = "contact_reason_last";

      try {
        if (!forceRefresh) {
          const cached =
            await contactReasonStorage.getItem<ContactReasonResponse[]>(cacheKey);

          if (cached) {
            set({ report: cached });
            if (!silent) set({ loading: false });
            return;
          }
        }

        const params = new URLSearchParams();
        if (teamName) params.append("team_name", teamName);

        const res = await fetch(
          `${import.meta.env.PUBLIC_URL_BACKEND}reports/contact-reasons?${params.toString()}`
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data: ContactReasonResponse[] = await res.json();

        await contactReasonStorage.setItem(cacheKey, data);
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
