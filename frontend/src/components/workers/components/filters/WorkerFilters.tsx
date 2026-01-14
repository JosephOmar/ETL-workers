// filters/workerFilters.ts
import type { Worker } from "@/components/types/worker.type";
import type { ZoneType } from "@/components/types/table-column";
import { useWorkersStore } from "@/components/store/workerStore";
import { toDateTime } from "@/components/utils/UtilsForTime";
import { isAgentWorkingAt } from "../utils/getEvaluationDateTime";
import type { Attendance } from "@/components/types/attendance.type";

export const filterByDate =
  (date: string, filterZone: ZoneType) =>
  (worker: Worker): boolean => {
    if (!date) return true;

    return worker.schedules.some((s) =>
      filterZone === "PE"
        ? s.start_date_pe === date
        : s.start_date_es === date
    );
};

export const filterByTeam =
  (teams: string[]) =>
  (worker: Worker): boolean => {
    if (teams.length === 0) return true;
    return teams.includes(worker.team?.name);
};

export const filterByContract =
  (contracts: string[]) =>
  (worker: Worker): boolean => {
    if (contracts.length === 0) return true;
    return contracts.includes(worker.contract_type?.name);
};

const getAttendanceAtDateTime = (
    worker: Worker,
    dateTime: Date,
    filterZone: ZoneType
  ): Attendance | undefined => {
    const schedule = worker.schedules.find((s) =>
      isAgentWorkingAt(dateTime, filterZone)(s)
    );

    if (!schedule) return undefined;

    const startDate =
      filterZone === "PE" ? schedule.start_date_pe : schedule.start_date_es;

    return worker.attendances.find((a) => a.date === startDate);
  };

export const filterByAttendance =
  (
    attendance: string[],
    date: string,
    evaluationDateTime: Date | null,
    filterZone: ZoneType
  ) =>
  (worker: Worker): boolean => {
    if (attendance.length === 0) return true;

    let record: Attendance | undefined;

    if (evaluationDateTime) {
      record = getAttendanceAtDateTime(
        worker,
        evaluationDateTime,
        filterZone
      );
    } 

    else {
      record = worker.attendances.find((a) => a.date === date);
    }

    if (attendance.includes("Absent")) {
      return !record || !record.status;
    }

    return !!record?.status && attendance.includes(record.status);
  };

export const filterByTimeRange =
  (range: string[], filterDate: string, filterZone: ZoneType) =>
  (w: Worker): boolean => {
    if (range.length === 0) return true;
    if (!filterDate) return true;
    console.log('xd')
    console.log(range)
    return w.schedules.some((s) => {
      const startDate =
        filterZone === "PE" ? s.start_date_pe : s.start_date_es;
      const endDate =
        filterZone === "PE" ? s.end_date_pe : s.end_date_es;

      const startTime =
        filterZone === "PE" ? s.start_time_pe : s.start_time_es;
      const endTime =
        filterZone === "PE" ? s.end_time_pe : s.end_time_es;

      if (!startDate || !endDate || !startTime || !endTime) return false;

      const shiftStart = toDateTime(startDate, startTime);
      const shiftEnd = toDateTime(endDate, endTime);
      console.log(startDate, startTime)
      console.log(shiftStart)
      console.log(shiftEnd)
      if (range.length === 1) {
        const point = toDateTime(filterDate, range[0]);
        return point >= shiftStart && point <= shiftEnd;
      }

      const [from, to] = range;

      const rangeStart = toDateTime(filterDate, from);
      let rangeEnd = toDateTime(filterDate, to);

      if (rangeEnd < rangeStart) {
        rangeEnd = new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      return (
        shiftStart <= rangeEnd &&
        shiftEnd >= rangeStart
      );
    });
  };
