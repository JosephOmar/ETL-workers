import type { Worker } from "@/components/types/worker.type";
import type { Schedule } from "@/components/types/schedule.type";
import type { Attendance } from "@/components/types/attendance.type";
import type { Column, ZoneType } from "@/components/types/table-column";
import { timeToMinutes } from "@/components/utils/UtilsForTime";
import { toDateTime } from "@/components/utils/UtilsForTime";
import { getEvaluationDateTime } from "./getEvaluationDateTime";
import { useWorkersStore } from "@/components/store/workerStore";
import { isAgentWorkingAt } from "./getEvaluationDateTime";

interface Props {
  filterDate: string;
  filterZone: ZoneType;
  evaluationDateTime: Date | null;
}

export const WorkersTableColumns = ({
  filterDate,
  filterZone,
  evaluationDateTime
}: Props): Column<Worker>[] => {
  const getScheduleOfDay = (worker: Worker): Schedule | undefined => {
    return worker.schedules.find((s) =>
      filterZone === "PE"
        ? s.start_date_pe === filterDate
        : s.start_date_es === filterDate
    );
  };

  const getScheduleAtDateTime = (
    w: Worker,
    dateTime: Date,
    filterZone: ZoneType
  ) => {
    return w.schedules.find((s) => {
      const start = toDateTime(
        filterZone === "PE" ? s.start_date_pe : s.start_date_es,
        filterZone === "PE" ? s.start_time_pe : s.start_time_es
      );

      const end = toDateTime(
        filterZone === "PE" ? s.end_date_pe : s.end_date_es,
        filterZone === "PE" ? s.end_time_pe : s.end_time_es
      );

      return dateTime >= start && dateTime <= end;
    });
  };

  const getAttendanceOfDay = (worker: Worker): Attendance | undefined => {
    return worker.attendances.find((a) => 
      a.date === filterDate
    )
  }

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

  return [
    {
      key: "document",
      header: "Document",
      render: (w) => w.document,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (w) => w.name?.toLowerCase() ?? "",
      render: (w) => w.name,
    },
    {
      key: "team",
      header: "Team",
      sortable: true,
      sortValue: (w) => w.team?.name?.toLowerCase() ?? "",
      render: (w) => w.team?.name || "N/A",
    },
    {
      key: "supervisor",
      header: "Supervisor",
      sortable: true,
      sortValue: (w) => w.supervisor?.toLowerCase() ?? "",
      render: (w) => w.supervisor,
    },
    {
      key: "contract",
      header: "Contract Type",
      render: (w) => w.contract_type?.name || "N/A",
    },
    {
      key: "schedule",
      header: "Schedule",
      sortable: true,
      sortValue: (w) => {
        const s = getScheduleOfDay(w);
        return timeToMinutes(
          filterZone === "PE" ? s?.start_time_pe : s?.start_time_es
        );
      },
      render: (w) => {
        const s = evaluationDateTime
          ? getScheduleAtDateTime(w, evaluationDateTime, filterZone)
          : getScheduleOfDay(w);

        if (!s) return "-";

        if (!evaluationDateTime && s.is_rest_day) return "Descanso";

        return filterZone === "PE"
          ? `${s.start_time_pe?.slice(0, 5)} - ${s.end_time_pe?.slice(0, 5)}`
          : `${s.start_time_es?.slice(0, 5)} - ${s.end_time_es?.slice(0, 5)}`;
      },
    },
    {
        key: "break",
        header: "Break",
        sortable: true,
        sortValue: (w) => {
        const s = getScheduleOfDay(w);
        return timeToMinutes(
            filterZone === "PE"
            ? s?.break_start_time_pe
            : s?.break_start_time_es
        );
        },
        render: (w) => {
          const s = evaluationDateTime
            ? getScheduleAtDateTime(w, evaluationDateTime, filterZone)
            : getScheduleOfDay(w);

          if (!s) return "-";

          if (
            w.contract_type?.name === "Part Time" ||
            w.contract_type?.name === "Ubycall" ||
            s.is_rest_day ||
            w.role?.name !== "Agent"
          ) {
            return "-";
          }

          const start =
            filterZone === "PE"
              ? s.break_start_time_pe
              : s.break_start_time_es;

          const end =
            filterZone === "PE"
              ? s.break_end_time_pe
              : s.break_end_time_es;

          if (!start || !end) return "-";

          return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
        },
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (w) => {
        if (evaluationDateTime) {
          const attendance = getAttendanceAtDateTime(w, evaluationDateTime, filterZone);

          return attendance?.status || "Absent";
        }

        const a = getAttendanceOfDay(w);
        return a?.status || "Absent";
      },
    },
    {
      key: "checkIn",
      header: "Check In",
      render: (w) => {
        if (evaluationDateTime) {
          const attendance = getAttendanceAtDateTime(w, evaluationDateTime, filterZone);

          return attendance?.check_in || "-";
        }

        const a = getAttendanceOfDay(w);
        return a?.check_in || "-";
      },
    },
    {
      key: "checkOut",
      header: "Check Out",
      render: (w) => {
        if (evaluationDateTime) {
          const attendance = getAttendanceAtDateTime(w, evaluationDateTime, filterZone);

          return attendance?.check_out || "-";
        }

        const a = getAttendanceOfDay(w);
        return a?.check_out || "-";
      },
    },
    {
      key: "adherence",
      header: "Adherence",
      render: (w) => {
        if (evaluationDateTime) {
          const attendance = getAttendanceAtDateTime(
            w,
            evaluationDateTime,
            filterZone
          );

          return attendance?.adherence != null
            ? `${(attendance.adherence * 100).toFixed(0)}%`
            : "-";
        }

        const a = getAttendanceOfDay(w);

        return a?.adherence != null
          ? `${(a.adherence * 100).toFixed(0)}%`
          : "-";
      },
    },
    {
      key: "auxNonProductive",
      header: "Aux No Productive",
      render: (w) => {
        if (evaluationDateTime) {
          const attendance = getAttendanceAtDateTime(w, evaluationDateTime, filterZone);

          return attendance?.time_aux_non_productive || "-";
        }

        const a = getAttendanceOfDay(w);
        return a?.time_aux_non_productive || "-";
      },
    },
    {
      key: "email",
      header: "Email",
      render: (w) => w.api_email ?? "N/A",
    },
  ];
};
