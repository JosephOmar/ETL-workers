import { useWorkersStore } from "@/components/store/workerStore";
import { filterByDate, filterByAttendance, filterByContract, filterByTeam, filterByTimeRange } from "../filters/WorkerFilters";
import { filterByBulkSearch } from "../search/filterByBulkSearch";
import { useMemo } from "react";
import { getEvaluationDateTime } from "./getEvaluationDateTime";

export const useFilteredWorkers = () => {
  const workers = useWorkersStore(s => s.workers);

  const {
    filterDate,
    filterZone,
    filterTeams,
    filterContract,
    filterAttendance,
    searchText,
    searchField,
    filterTimeRange,
  } = useWorkersStore();

  const evaluationDateTime = useMemo(
      () => getEvaluationDateTime(filterDate, filterTimeRange),
      [filterDate, filterTimeRange]
  );

  return useMemo(() => {
    return workers
      .filter(filterByDate(filterDate, filterZone))
      .filter(filterByTimeRange(filterTimeRange, filterDate, filterZone))
      .filter(filterByTeam(filterTeams))
      .filter(filterByContract(filterContract))
      .filter(filterByAttendance(filterAttendance, filterDate, evaluationDateTime, filterZone))
      .filter(filterByBulkSearch(searchText, searchField));
  }, [
    workers,
    filterDate,
    filterZone,
    filterTimeRange,
    filterTeams,
    filterContract,
    filterAttendance,
    searchText,
    searchField,
  ]);
};
