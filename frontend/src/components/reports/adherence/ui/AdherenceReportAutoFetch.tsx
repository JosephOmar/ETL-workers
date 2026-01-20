import { useAdherenceReportStore } from "@/components/store/adherenceReportStore"
import { useDebouncedEffect } from "../hook/debounceEffect"

export function AdherenceReportAutoFetch() {
  const {
    dateFrom,
    dateTo,
    teamName,
    coordinator,
    fetchReport,
  } = useAdherenceReportStore()

  useDebouncedEffect(
    () => {
      fetchReport(false, true)
    },
    [dateFrom, dateTo, teamName, coordinator],
    500
  )

  return null
}
