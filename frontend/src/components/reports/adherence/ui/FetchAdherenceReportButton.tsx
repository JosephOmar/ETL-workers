import { Button } from "@/components/ui/button"
import { useAdherenceReportStore } from "@/components/store/adherenceReportStore"

interface Props {
  forceRefresh?: boolean
}

export default function FetchAdherenceReportButton({
  forceRefresh = false,
}: Props) {
  const fetchReport = useAdherenceReportStore(s => s.fetchReport)
  const loading = useAdherenceReportStore(s => s.loading)

  const handleClick = () => {
    fetchReport(forceRefresh)
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Loading report..." : "Update report"}
    </Button>
  )
}
