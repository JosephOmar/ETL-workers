import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";
import { getAttendanceByDate } from "../utils/helpersWorkersTableColumns";

export const copyWorkersAttendance = (workers: Worker[], filterDate: string) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      const { schedule, attendance } = getAttendanceByDate(w.schedules, filterDate);

      return [
        w.document,
        w.name,
        attendance?.status ?? "Absent",
        w.api_email
      ];
    },
    {
      includeHeader: true,
    }
  );
};
