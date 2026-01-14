import type { ZoneType } from "@/components/types/table-column";
import type { Schedule } from "@/components/types/schedule.type";
import { toDateTime } from "@/components/utils/UtilsForTime";

export const getEvaluationDateTime = (
  filterDate: string,
  filterTimeRange: string[]
): Date | null => {
  if (!filterDate || filterTimeRange.length === 0) return null;

  const time = filterTimeRange[0];

  return new Date(`${filterDate}T${time}:00`);
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
