// filters/workerFilters.ts
import type { Worker } from "@/components/types/worker.type";
import type { ZoneType } from "@/components/types/table-column";
import { useWorkersStore } from "@/components/store/workerStore";
import { toDateTime } from "@/components/utils/UtilsForTime";
import { isAgentWorkingAt } from "../utils/getEvaluationDateTime";
import type { Attendance } from "@/components/types/attendance.type";
import { getAttendanceFromSchedule } from "../utils/WorkersTableColumns";

export const filterByDate =
  (date: string, filterZone: ZoneType) =>
  (worker: Worker): boolean => {
    if (!date) return true;

    return worker.schedules.some((s) => {
      const sameDate =
        filterZone === "PE"
          ? s.start_date_pe === date
          : s.start_date_es === date;

      return sameDate && !s.is_rest_day;
    });
};

export const filterByTeam =
  (teams: string[]) =>
  (worker: Worker): boolean => {
    if (teams.length === 0) return true;
    return teams.includes(worker.team?.name);
};

export const filterByRole =
  (roles: string[]) =>
  (worker: Worker): boolean => {
    if (roles.length === 0) return true;
    return roles.includes(worker.role?.name);
};

export const filterByContract =
  (contracts: string[]) =>
  (worker: Worker): boolean => {
    if (contracts.length === 0) return true;
    return contracts.includes(worker.contract_type?.name);
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
    console.log(attendance)
    console.log(date)
    // console.log(evaluationDateTime)
    if (evaluationDateTime) {
      const schedule = worker.schedules.find(
        isAgentWorkingAt(evaluationDateTime, filterZone)
      );
      record = schedule?.attendances?.[0];
    } else {
      // if(worker.schedules[1].attendances[0]?.status === 'Present')
      //   console.log(worker)
      const schedule = worker.schedules.find((s) =>
        filterZone === "PE"
          ? s.start_date_pe === date
          : s.start_date_es === date
      );
      record = schedule?.attendances?.[0];
    }

    if (attendance.includes("Absent")) {
      return !record;
    }

    return !!record?.status && attendance.includes(record.status);
  };

export const filterByAdherence =
  (threshold: number, filterDate: string, evaluationDateTime: Date | null, filterZone: string) =>
  (worker: Worker): boolean => {
    const schedule = evaluationDateTime
      ? worker.schedules.find((s) => s.start_date_pe === filterDate)
      : worker.schedules.find((s) =>
          filterZone === "PE" ? s.start_date_pe === filterDate : s.start_date_es === filterDate
        );

    const attendance = getAttendanceFromSchedule(schedule, filterZone as "PE" | "ES");

    const adherence = attendance?.adherence != null ? attendance.adherence * 100 : 0;
    const aux_no_productive = attendance?.time_aux_no_productive != null ? attendance.time_aux_no_productive : 0;

    return adherence < threshold && aux_no_productive > 20;
  };

export const filterByProductive =
  (worker: Worker): boolean => {
    return worker.productive === "Sí";
  };

export const filterByTimeRange =
  (selectedTime: string | null, filterDate: string, filterZone: ZoneType) =>
  (worker: Worker): boolean => {
    if (!filterDate) return true;

    if (!selectedTime) {
      return worker.schedules.some((s) =>
        filterZone === "PE"
          ? s.start_date_pe === filterDate
          : s.start_date_es === filterDate
      );
    }

    const point = toDateTime(filterDate, selectedTime);

    return worker.schedules.some((s) => {
      const startDate = filterZone === "PE" ? s.start_date_pe : s.start_date_es;
      const endDate = filterZone === "PE" ? s.end_date_pe : s.end_date_es;
      const startTime = filterZone === "PE" ? s.start_time_pe : s.start_time_es;
      const endTime = filterZone === "PE" ? s.end_time_pe : s.end_time_es;

      if (!startDate || !endDate || !startTime || !endTime) return false;

      const shiftStart = toDateTime(startDate, startTime);
      const shiftEnd = toDateTime(endDate, endTime);

      return point >= shiftStart && point <= shiftEnd;
    });
  };
