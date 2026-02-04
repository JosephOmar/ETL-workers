import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";
import type { Schedule } from "@/components/types/schedule.type";
import { getAttendanceByDate } from "../utils/helpersWorkersTableColumns";

const getDSOFromSchedules = (schedules: Schedule[]) => {
  const restDay = schedules.find(s => s.start_time_pe == null);
  if (!restDay) return "-";

  const date = new Date(restDay.start_date_pe + "T00:00:00");
  return date.toLocaleDateString("es-PE", { weekday: "long" });
};

const isValidTime = (time?: string | null) =>
  time != null && time !== "00:00:00";

const getWorkingSchedule = (schedules?: any[]) => {
  if (!Array.isArray(schedules)) return undefined;

  return schedules.find(
    s =>
      isValidTime(s?.start_time_pe) &&
      isValidTime(s?.end_time_pe)
  );
};

export const copyWorkersPilotFormat = (workers: Worker[]) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      const workingSchedule = getWorkingSchedule(w.schedules);
      const dso = getDSOFromSchedules(w.schedules);

      return [
        w.document,                         // DNI
        w.api_email,                        // Usuario
        w.name,                             // Nombre
        w.supervisor,                       // Supervisor
        dso,                                // DSO
        workingSchedule?.start_time_pe ?? "-", // Hora Inicio Perú
        workingSchedule?.end_time_pe ?? "-",   // Hora Fin Perú
        workingSchedule?.start_time_es ?? "-", // Hora Inicio España
        workingSchedule?.end_time_es ?? "-",   // Hora Fin España
      ];
    },
    {
      includeHeader: false,
      // header: [
      //   "DNI",
      //   "Usuarios",
      //   "Nombre",
      //   "SUPERVISOR",
      //   "DSO",
      //   "Hora Inicio Perú",
      //   "Hora Fin Perú",
      //   "Hora Inicio España",
      //   "Hora Fin España",
      // ],
    }
  );
};
