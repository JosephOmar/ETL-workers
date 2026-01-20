import React, { useEffect, useState, useMemo } from "react";
import { useWorkersStore } from "../store/workerStore";
import type { Worker } from "../types/worker.type";
import type { Schedule } from "../types/schedule.type";
import { TruncateWorkersButton } from "./components/buttons/TruncateWorkersButton";
import { Button } from "@components/ui/button";
import WorkersDateFilter from "./components/filters/WorkerDateFilter";
import UpdateWorkersButton from "./components/buttons/UpdateWorkersButton";
import FilesForUploadWorkersButton from "./components/buttons/FilesForUploadWorkersButton";
import WorkersZoneFilter from "./components/filters/WorkersZoneFilter";
import { UploadSchedulesButton } from "./components/buttons/UploadSchedulesButton";
import { UploadWorkersButton } from "./components/buttons/UploadWorkersButton";
import { WorkersTableColumns } from "./components/utils/WorkersTableColumns";
import { UploadAttendanceButton } from "./components/buttons/UploadAttendanceButton";
import WorkersTeamFilter from "./components/filters/WorkersTeamFilter";
import WorkersContractFilter from "./components/filters/WorkersContractFilter";
import WorkersAttendanceFilter from "./components/filters/WorkerAttendanceFilter";
import { WorkersBulkSearch } from "./components/search/WorkerBulkSearch";
import { useFilteredWorkers } from "./components/utils/useFilteredWorkers";
import { useTableSort } from "./components/utils/useTableSort";
import { usePagination } from "./components/utils/usePagination";
import { TableHeader } from "./components/ui/TableHeader";
import { WorkersActionsBar } from "./components/ui/WorkerActionsBar";
import { WorkersStatus } from "./components/ui/WorkersStatus";
import { ClearFiltersButton } from "./components/filters/ClearFiltersButton";
import WorkersTimeRangeFilter from "./components/filters/WorkersTimeRangeFilter";
import WorkersRoleFilter from "./components/filters/WorkersRoleFilter";
import WorkersAdherenceFilter from "./components/filters/WorkersAdherenceFilter";
import WorkersProductiveFilter from "./components/filters/WorkersProductiveFilter";
import { copyWorkersAttendance } from "./components/buttonsCopy/copyWorkersAttendance";
import { copyWorkersSchedules } from "./components/buttonsCopy/copyWorkersSchedules";
import { getEvaluationDateTime } from "./components/utils/helpersWorkersTableColumns";
import { copyWorkerUrlApi } from "./components/buttonsCopy/copyWorkersUrlApi";

const WorkersTable: React.FC = () => {
  const loading = useWorkersStore((s) => s.loading);
  const error = useWorkersStore((s) => s.error);
  const filterDate = useWorkersStore((s) => s.filterDate);
  const filterZone = useWorkersStore((s) => s.filterZone);
  const workers = useFilteredWorkers();
  const filterTimeRange = useWorkersStore(s => s.filterTimeRange);

  const evaluationDateTime = useMemo(
    () => getEvaluationDateTime(filterDate, filterTimeRange),
    [filterDate, filterTimeRange]
  );

  const columns = useMemo(
    () =>
      WorkersTableColumns({
        filterDate,
        filterZone,
        evaluationDateTime,
      }),
    [filterDate, filterZone, evaluationDateTime]
  );

  const { sortedWorkers, sortKey, sortDirection, onSort } =useTableSort(workers, columns);
  const { pageData: currentWorkers, currentPage, totalPages, next, prev} = usePagination(sortedWorkers, 100);

  useEffect(() => {
    useWorkersStore.getState().fetchWorkers();
  }, []);

  return (
    <div className="overflow-x-auto">
      <WorkersStatus loading={loading} error={error} />
      <WorkersActionsBar />
      <div className="flex gap-3">
        <WorkersDateFilter />
        <WorkersZoneFilter />
      </div>
      <div className="grid grid-cols-6 gap-4">
        <WorkersTeamFilter />
        <div className="flex flex-col gap-4">
          <WorkersContractFilter />
          <WorkersAttendanceFilter />
        </div>
        <div className="flex flex-col gap-4">
          <WorkersRoleFilter />
          <WorkersAdherenceFilter />
          <WorkersProductiveFilter />
        </div>
        <WorkersBulkSearch />
        <WorkersTimeRangeFilter/>
      </div>
      <div className="flex gap-4">
        <h2 className="text-2xl font-bold mb-4">Workers List - {workers.length}</h2>
        <ClearFiltersButton />
        <Button className="btn-grad text-black" onClick={() => copyWorkersAttendance(workers, filterDate)}>
          Copy Attendance
        </Button>
        <Button className="btn-grad text-black" onClick={() => copyWorkersSchedules(workers, filterDate)}>
          Copy Schedules
        </Button>
        <Button className="btn-grad text-black" onClick={() => copyWorkerUrlApi(workers)}>
          Copy Url
        </Button>
      </div>
      <table className=" min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <TableHeader columns={columns} sortKey={sortKey} sortDirection={sortDirection} onSort={onSort}/>
        <tbody>
          {currentWorkers.map((worker) => (
            <tr key={worker.document} className="border-t">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.render(worker)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 gap-2">
        <Button
          onClick={prev}
          disabled={currentPage === 1}
          className="bg-blue-400"
        >
          Anterior
        </Button>
        <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>
        <Button
          onClick={next}
          disabled={currentPage === totalPages}
          className="bg-blue-400"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default WorkersTable;
