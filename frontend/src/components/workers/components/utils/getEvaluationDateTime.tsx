import type { ZoneType } from "@/components/types/table-column";
import type { Schedule } from "@/components/types/schedule.type";
import { toDateTime } from "@/components/utils/UtilsForTime";
import type { Attendance } from "@/components/types/attendance.type";

export const getEvaluationDateTime = (
  filterDate: string,
  filterTime: string | null
): Date | null => {
  if (!filterDate || !filterTime) return null;

  return new Date(`${filterDate}T${filterTime}:00`);
};


export const isAgentWorkingAt =
  (dateTime: Date, filterZone: ZoneType) =>
  (s: Schedule): boolean => {
    const start = toDateTime(
      filterZone === "PE" ? s.start_date_pe : s.start_date_es,
      filterZone === "PE" ? s.start_time_pe : s.start_time_es
    );

    const end = toDateTime(
      filterZone === "PE" ? s.end_date_pe : s.end_date_es,
      filterZone === "PE" ? s.end_time_pe : s.end_time_es
    );

    return dateTime >= start && dateTime <= end;
  };


export const getAttendanceByDate = (
  schedules: Schedule[] | undefined,
  filterDate: string
): {
  schedule?: Schedule;
  attendance?: Attendance;
} => {
  if (!schedules?.length) {
    return {};
  }

  const schedule = schedules.find(
    s => s.start_date_pe === filterDate
  );

  if (!schedule || !schedule.attendances?.length) {
    return { schedule };
  }

  return {
    schedule,
    attendance: schedule.attendances[0],
  };
};
