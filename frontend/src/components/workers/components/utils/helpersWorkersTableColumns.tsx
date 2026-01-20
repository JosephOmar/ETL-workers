import type { Worker } from "@/components/types/worker.type";
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


export const getAttendanceFromSchedule = (
    schedule?: Schedule,
    filterZone?: ZoneType
  ): Attendance | undefined => {
    if (!schedule || !schedule.attendances?.length) return undefined;

    const scheduleDate =
      filterZone === "PE"
        ? schedule.start_date_pe
        : schedule.start_date_es;

    return schedule.attendances.find(
      (a) => a.date === scheduleDate
    );
  };

export const getScheduleOfDay = (worker: Worker, filterZone: ZoneType, filterDate: string): Schedule | undefined =>
    worker.schedules.find((s) =>
      filterZone === "PE"
        ? s.start_date_pe === filterDate
        : s.start_date_es === filterDate
    );

export const getScheduleAtDateTime = (
    worker: Worker,
    dateTime: Date,
    filterZone: ZoneType
  ): Schedule | undefined =>
    worker.schedules.find(
      isAgentWorkingAt(dateTime, filterZone)
    );

export const getAttendanceStatus = (
  w: Worker,
  evaluationDateTime: Date | null,
  filterZone: "PE" | "ES",
  filterDate: string,
): string => {
  const schedule = evaluationDateTime
    ? getScheduleAtDateTime(w, evaluationDateTime, filterZone)
    : getScheduleOfDay(w, filterZone, filterDate);

  return (
    getAttendanceFromSchedule(schedule, filterZone)?.status ?? "Absent"
  );
};
