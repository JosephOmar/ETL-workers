import { copyToClipboard } from "../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";
import { getAttendanceByDate } from "../utils/getEvaluationDateTime";

export const copyWorkersAttendance = (workers: Worker[], filterDate: string) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      const { schedule, attendance } = getAttendanceByDate(w.schedules, filterDate);

      return [
        w.document,
        w.name,
        attendance?.status ?? "Absent",
      ];
    },
    {
      includeHeader: true,
      header: ["Document", "Name", "Attendance"],
    }
  );
};
