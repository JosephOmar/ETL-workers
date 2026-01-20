import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";
import { getAttendanceByDate } from "../utils/helpersWorkersTableColumns";

export const copyWorkersSchedules = (workers: Worker[], filterDate: string) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      const { schedule, attendance } = getAttendanceByDate(w.schedules, filterDate);
      const critical = attendance?.adherence != null  ? (attendance?.adherence < 0.6 ? 'Critical' : '') : ''
      return [
        w.document,
        w.name,
        w.team.name,
        w.supervisor,
        w.coordinator,
        `${schedule?.start_time_pe} - ${schedule?.end_time_pe}` ,
        attendance?.status ?? "Absent",
        attendance?.check_in ?? "-",
        attendance?.check_out ?? "-",
        `${attendance?.adherence} %` || "-",
        attendance?.time_aux_no_productive ?? "-",
      ];
    },
    {
      includeHeader: true,
      header: ["Document", "Name","Team", "Supervisor", "Coordinator", "Schedule", "Status", "Check_in", "Check_out", "Adherence %", "Time in Aux No Productive"],
    }
  );
};
