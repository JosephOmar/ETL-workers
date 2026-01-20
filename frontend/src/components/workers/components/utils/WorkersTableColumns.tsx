import type { Worker } from "@/components/types/worker.type";
import type { Schedule } from "@/components/types/schedule.type";
import type { Attendance } from "@/components/types/attendance.type";
import type { Column, ZoneType } from "@/components/types/table-column";

import { timeToMinutes, toDateTime } from "@/components/utils/UtilsForTime";
import { getAttendanceByDate, getScheduleAtDateTime, isAgentWorkingAt, getScheduleOfDay, getAttendanceStatus, getAttendanceFromSchedule } from "./helpersWorkersTableColumns";

interface Props {
  filterDate: string;
  filterZone: ZoneType;
  evaluationDateTime: Date | null;
}

export const WorkersTableColumns = ({
  filterDate,
  filterZone,
  evaluationDateTime,
}: Props): Column<Worker>[] => {
  
  const getEffectiveSchedule = (w: Worker): Schedule | undefined => {
    return evaluationDateTime
    ? getScheduleAtDateTime(w, evaluationDateTime, filterZone)
    : getScheduleOfDay(w, filterZone, filterDate);
  }
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
        const s = getScheduleOfDay(w, filterZone, filterDate);
        return timeToMinutes(
          filterZone === "PE" ? s?.start_time_pe : s?.start_time_es
        );
      },
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        if (!schedule) return "-";
        if (!evaluationDateTime && schedule.is_rest_day) return "Descanso";

        return filterZone === "PE"
          ? `${schedule.start_time_pe?.slice(0, 5)} - ${schedule.end_time_pe?.slice(0, 5)}`
          : `${schedule.start_time_es?.slice(0, 5)} - ${schedule.end_time_es?.slice(0, 5)}`;
      },
    },
    {
      key: "break",
      header: "Break",
      sortable: true,
      sortValue: (w) => {
          const schedule = getEffectiveSchedule(w)

        if (
          !schedule ||
          schedule.is_rest_day ||
          w.role?.name !== "Agent" ||
          ["Part Time", "Ubycall"].includes(w.contract_type?.name ?? "")
        ) {
          return 0;
        }

        const start =
          filterZone === "PE" ? schedule.break_start_time_pe : schedule.break_start_time_es;

        return start ? timeToMinutes(start) : 0;
      },
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        if (
          !schedule ||
          schedule.is_rest_day ||
          w.role?.name !== "Agent" ||
          ["Part Time", "Ubycall"].includes(w.contract_type?.name ?? "")
        ) {
          return "-";
        }

        const start =
          filterZone === "PE" ? schedule.break_start_time_pe : schedule.break_start_time_es;
        const end =
          filterZone === "PE" ? schedule.break_end_time_pe : schedule.break_end_time_es;

        return start && end ? `${start.slice(0, 5)} - ${end.slice(0, 5)}` : "-";
      },
    },
    {
      key: "obs",
      header: "Obs",
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        return schedule?.obs ?? ''
      },
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (w) => {
        const schedule = getEffectiveSchedule(w)
        const attendance = getAttendanceFromSchedule(schedule, filterZone);
        const status = attendance?.status || "Absent";

        const statusClass = (() => {
          switch (status) {
            case "Present":
              return "text-green-500 font-semibold";
            case "Late":
              return "text-orange-500 font-semibold";
            case "Absent":
              return "text-red-500 font-semibold";
            default:
              return "";
          }
        })();

        return <span className={statusClass}>{status}</span>;
      },
    },
    {
      key: "checkIn",
      header: "Check In",
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        return getAttendanceFromSchedule(schedule, filterZone)?.check_in || "-";
      },
    },
    {
      key: "checkOut",
      header: "Check Out",
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        return getAttendanceFromSchedule(schedule, filterZone)?.check_out || "-";
      },
    },
    {
      key: "adherence",
      header: "Adherence",
      sortable: true,
      sortValue: (w) => {
        const schedule = getEffectiveSchedule(w)

        const a = getAttendanceFromSchedule(schedule, filterZone);
        return a?.adherence != null ? a.adherence: 0;
      },
      render: (w) => {
        const schedule = getEffectiveSchedule(w)

        const a = getAttendanceFromSchedule(schedule, filterZone);
        const adherence = a?.adherence != null ? a.adherence : 0;

        const adherenceClass = adherence < 90 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'

        return <span className={adherenceClass}>{adherence}%</span>;
      },
    },
    {
      key: "auxNoProductive",
      header: "Aux No Productive",
      sortable: true,
      sortValue: (w) => {
        const schedule = getEffectiveSchedule(w)
        const a = getAttendanceFromSchedule(schedule, filterZone);
        return a?.time_aux_no_productive ?? 0;
      },
      render: (w) => {
        const schedule = getEffectiveSchedule(w)
        const attendance = getAttendanceFromSchedule(schedule, filterZone)
        const aux_no_productive =  attendance?.time_aux_no_productive || 0;
        const auxClass = aux_no_productive > 20 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'

        return <span className={auxClass}>{aux_no_productive}</span>;
      },
    },
    {
      key: "email",
      header: "Email",
      render: (w) => w.api_email ?? "N/A",
    },
  ];
};
