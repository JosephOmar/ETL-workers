"use client";

import { useEffect, useMemo, useState } from "react";
import { useSlaBreachedReportStore } from "@/components/store/slaBreachedReportStore";
import { SlaBreachedMainTable } from "./SlaBreachedMainTable";
import { SlaBreachedAgentsTable } from "./SlaBreachedAgentsTable";
import { SlaBreachedSupervisorsTable } from "./SlaBreachedSupervisorsTable";
import { UploadSlaBreachedButton } from "./UploadSlaBreachedButton";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

const TEAMS = [
  "Customer Tier1",
  "Rider Tier1",
  "Vendor Chat",
  "Vendor Call",
];

type Zone = "PE" | "ES";

export const SlaBreachedView = () => {
  const {
    report,
    fetchReport,
    loading,
    zone,
    setZone,
    date,
    setDate,
  } = useSlaBreachedReportStore();

  const [hour, setHour] = useState("");
  const [team, setTeam] = useState("");
  console.log(report)
  useEffect(() => {
    fetchReport(false, false);
  }, [zone, date]);

  const selectedInterval = useMemo(() => {
    if (!report || !hour || !team) return null;

    return report.intervals.find((i) =>
      i.team === team &&
      (zone === "PE"
        ? i.interval_pe === hour
        : i.interval_es === hour)
    );
  }, [report, hour, team, zone]);

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3 mb-4 w-[80%] mx-auto">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Seleccione team</option>
          {TEAMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={hour} onChange={(e) => setHour(e.target.value)}>
          <option value="">Seleccione hora</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <select value={zone} onChange={(e) => setZone(e.target.value as Zone)}>
          <option value="PE">Perú</option>
          <option value="ES">España</option>
        </select>
        <UploadSlaBreachedButton onAfterUpload={() => fetchReport(true)}/>
        <button
          onClick={() => fetchReport(true)}
          disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabla principal */}
      {/* {report && (
        <SlaBreachedMainTable
          intervals={report.intervals}
          zone={zone}
          loading={loading}
        />
      )} */}

      {/* Tablas de detalle */}
      {selectedInterval && (
        <>
          <SlaBreachedSupervisorsTable
            data={selectedInterval.supervisors}
            loading={loading}
            interval={hour}
            zone={zone}
            team={team}
          />

          <SlaBreachedAgentsTable
            data={selectedInterval.agents}
            loading={loading}
            interval={hour}
            zone={zone}
            team={team}
          />
        </>
      )}
    </>
  );
};
