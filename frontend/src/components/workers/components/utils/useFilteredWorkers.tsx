import { useWorkersStore } from "@/components/store/workerStore";
import { filterByDate, filterByAttendance, filterByContract, filterByTeam, filterByTimeRange, filterByRole, filterByAdherence, filterByProductive } from "../filters/WorkerFilters";
import { filterByBulkSearch } from "../search/filterByBulkSearch";
import { useMemo } from "react";
import { getEvaluationDateTime } from "./getEvaluationDateTime";

export const useFilteredWorkers = () => {
  const workers = useWorkersStore(s => s.workers);

  const {
    filterDate,
    filterZone,
    filterTeams,
    filterRole,
    filterContract,
    filterAttendance,
    filterAdherenceBelow,
    filterProductive,
    searchText,
    searchField,
    filterTimeRange,
  } = useWorkersStore();

  const evaluationDateTime = useMemo(
      () => getEvaluationDateTime(filterDate, filterTimeRange),
      [filterDate, filterTimeRange]
  );

  return useMemo(() => {
    const workersFiltered = workers
      .filter(filterByDate(filterDate, filterZone))
      .filter(filterByTimeRange(filterTimeRange, filterDate, filterZone))
      .filter(filterByTeam(filterTeams))
      .filter(filterByRole(filterRole))
      .filter(filterByContract(filterContract))
      .filter((w) => !filterProductive || filterByProductive(w))
      .filter(filterByAttendance(filterAttendance, filterDate, evaluationDateTime, filterZone))
      .filter(filterByBulkSearch(searchText, searchField))
      .filter((w) => !filterAdherenceBelow || filterByAdherence(85, filterDate, evaluationDateTime, filterZone)(w))
      console.log(workersFiltered)
      return workersFiltered
  }, [
    workers,
    filterDate,
    filterZone,
    filterTimeRange,
    filterTeams,
    filterRole,
    filterContract,
    filterAdherenceBelow,
    filterProductive,
    filterAttendance,
    searchText,
    searchField,
  ]);
};
