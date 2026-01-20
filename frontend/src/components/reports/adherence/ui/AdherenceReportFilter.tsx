// components/reports/ui/AdherenceReportFilters.tsx
import { useAdherenceReportStore } from "@/components/store/adherenceReportStore"

export function AdherenceReportFilters() {
  const {
    dateFrom,
    dateTo,
    teamName,
    coordinator,
    setDateFrom,
    setDateTo,
    setTeamName,
    setCoordinator,
  } = useAdherenceReportStore()

  return (
    <div className="flex flex-wrap gap-4">
      {/* Date from */}
      <div>
        <label className="block text-sm mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Date to */}
      <div>
        <label className="block text-sm mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Team ID */}
      <div>
        <label className="block text-sm mb-1">Team</label>
        <select
          value={teamName ?? ""}
          onChange={(e) =>
            setTeamName(e.target.value)
          }
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Customer Tier1">Customer Tier1</option>
          <option value="Customer Tier2">Customer Tier2</option>
          <option value="Rider Tier1">Rider Tier1</option>
          <option value="Rider Tier2">Rider Tier2</option>
          <option value="Vendor Tier1">Vendor Tier1</option>
          <option value="Vendor Tier2">Vendor Tier2</option>
          <option value="Vendor Chat">Vendor Chat</option>
        </select>
      </div>

      {/* Coordinator */}
      {/* <div>
        <label className="block text-sm mb-1">Coordinator</label>
        <input
          type="text"
          value={coordinator ?? ""}
          onChange={(e) =>
            setCoordinator(e.target.value || undefined)
          }
          placeholder="Coordinator name"
          className="border rounded px-2 py-1"
        />
      </div> */}
    </div>
  )
}
