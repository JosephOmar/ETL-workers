import { create } from "zustand";
import localforage from "localforage";
import type { Worker } from "../types/worker.type";
import type { ZoneType, SearchField } from "../types/table-column";

import { TEAM_OPTIONS } from "../utils/Constans";

localforage.config({
  name: "ETL-Workers",
  storeName: "workers_store",
});

const ALL_TEAMS = TEAM_OPTIONS
  .filter((t) => t.value !== "All")
  .map((t) => t.value);

interface WorkersState {
  workers: Worker[];
  loading: boolean;
  error: string | null;

  filterDate: string;
  filterZone: ZoneType;
  filterTeams: string[];
  filterContract: string[];
  filterAttendance: string[];
  searchText: string;
  searchField: SearchField;
  filterTimeRange: string | null;
  filterRole: string[];
  filterAdherenceBelow: boolean;
  filterProductive: boolean;

  fetchWorkers: (forceRefresh?: boolean) => Promise<void>;

  setFilterDate: (date: string) => void;
  setFilterZone: (zone: ZoneType) => void;
  setFilterTeams: (teams: string[]) => void;
  setFilterContract: (contract: string[]) => void;
  setFilterAttendance: (attendance: string[]) => void;
  setSearchText: (text: string) => void;
  setSearchField: (field: SearchField) => void;
  setFilterTimeRange: (time: string | null) => void;
  setFilterRole: (roles: string[]) => void;
  setFilterAdherenceBelow: (value: boolean) => void;
  setFilterProductive: (value: boolean) => void;

  clearTimeRange: () => void;
  resetFilters: () => void;
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: [],
  loading: false,
  error: null,

  filterDate: new Date().toLocaleDateString("en-CA", {timeZone: "America/Lima"}),
  filterZone: "PE",
  filterTeams: ALL_TEAMS,
  filterContract: [],
  filterAttendance: [],
  searchText: "",
  searchField: "document",
  filterTimeRange: "",
  filterRole: [],
  filterAdherenceBelow: false,
  filterProductive: false,

  setFilterDate: (date) => {
    date == "Select Date" ? date = "" : ""
    set({ filterDate: date })
  },
  setFilterZone: (zone) => set({ filterZone: zone }),
  setFilterTeams: (teams) => {
    if (teams.includes("All")) {
      set({ filterTeams: ALL_TEAMS });
      return;
    }

    if (teams.length === 0) {
      set({ filterTeams: [] });
      return;
    }

    set({ filterTeams: teams });
  },
  setFilterContract: (contract) => {

    if (contract.length === 0) {
      set({ filterContract: []})
      return;
    }

    set({ filterContract: contract})
  },
  setFilterAttendance: (attendance) => {

    if (attendance.length === 0) {
      set({ filterAttendance: []})
      return;
    }
    set({ filterAttendance: attendance})
  },
  setSearchText: (text) => set({ searchText: text }),
  setSearchField: (field) => set({ searchField: field }),

  setFilterTimeRange: (time: string | null) =>
    set(() => ({filterTimeRange: time})),

  clearTimeRange: () => set({ filterTimeRange: null }),

  setFilterRole: (role) =>  {

    if (role.includes("Supervisor")) {
      set({ filterRole: ['Supervisor', 'Apoyo Tl', 'Apoyo Tl Uby'] });
      return;
    }

    if (role.length === 0) {
      set({ filterRole: []})
      return;
    }

    set({ filterRole: role})
  },
  setFilterAdherenceBelow: (value) => set({ filterAdherenceBelow: value }),
  setFilterProductive: (value) => set({ filterProductive: value }),
  resetFilters: () =>
    set({
      filterDate: "",
      filterZone: "PE",
      filterTeams: [],
      filterContract: [],
      filterAttendance: [],
      searchText: "",
      searchField: "document",
      filterAdherenceBelow: false,
      filterProductive: false,
    }),

  fetchWorkers: async (forceRefresh = false) => {
    set({ loading: true, error: null });

    try {
      if (!forceRefresh) {
        const cachedWorkers = await localforage.getItem<Worker[]>("workers");

        if (cachedWorkers && Array.isArray(cachedWorkers)) {
          set({ workers: cachedWorkers, loading: false });
          return;
        }
      }

      await localforage.removeItem("workers");

      const res = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`);

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();

      await localforage.setItem("workers", data);

      set({ workers: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

}));
