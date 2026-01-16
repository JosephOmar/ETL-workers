import { copyToClipboard } from "../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";
import { getAttendanceByDate } from "../utils/getEvaluationDateTime";

export const copyWorkersSchedules = (workers: Worker[], filterDate: string) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      const { schedule, attendance } = getAttendanceByDate(w.schedules, filterDate);

      return [
        w.document,
        w.name,
        `${schedule?.start_time_pe} - ${schedule?.end_time_pe}` ,
        attendance?.status ?? "Absent",
        attendance?.check_in ?? "-",
      ];
    },
    {
      includeHeader: true,
      header: ["Document", "Name", "Schedule", "Status", "Check_in"],
    }
  );
};
