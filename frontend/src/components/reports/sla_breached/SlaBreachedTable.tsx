"use client";

import { useMemo, useState, useEffect } from "react";
import { useSlaBreachedReportStore } from "@/components/store/slaBreachedReportStore";
import { CopyImageButton } from "@/components/utils/CopyImagenButton";
import { UploadSlaBreachedButton } from "./UploadSlaBreachedButton";
import { DailyCoordinatorSummary } from "./DailyCoordinatorSummary";
import { bold } from "@/components/ui/toUnicodeBold";

const TEAMS = [
  "Customer Tier1",
  "Rider Tier1",
  "Vendor Chat",
  "Vendor Call",
];

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

type Zone = "PE" | "ES";

const ZONES: { label: string; value: Zone }[] = [
  { label: "Perú", value: "PE" },
  { label: "España", value: "ES" },
];

const getTopByField = (
  data: any[],
  field: string,
  isSummary: boolean,
  limit = 3
) => {
  const map = new Map<string, number>();

  data.forEach((row) => {
    const key = row[field];
    if (!key) return;

    map.set(key, (map.get(key) ?? 0) + row.chat_breached);
  });

  const sorted = Array.from(map.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return isSummary ? sorted : sorted.slice(0, limit);
};

export const SlaBreachedTable = () => {
  const { report, fetchReport, loading } = useSlaBreachedReportStore();

  const [team, setTeam] = useState<string>("Customer Tier1");
  const [date, setDate] = useState<string>("");
  const [hour, setHour] = useState<string>("");
  const [zone, setZone] = useState<Zone>("PE");

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const dateField = zone === "PE" ? "date_pe" : "date_es";
  const intervalField = zone === "PE" ? "interval_pe" : "interval_es";

  const filteredData = useMemo(() => {
    if (!report) return [];

    return report.filter((row) => {
      if (team && row.team !== team) return false;

      if (date && row[dateField] !== date) return false;

      // 🔹 si no hay hora seleccionada → no filtrar por intervalo
      if (!hour) return true;

      const interval = row[intervalField];
      if (!interval) return false;

      return interval === hour;
    });
  }, [report, team, date, hour, zone]);

  const isDailySummary = !hour;

  const totalChats = useMemo(
    () => filteredData.reduce((sum, r) => sum + r.chat_breached, 0),
    [filteredData]
  );

  const agentsWithBreached = useMemo(() => {
    const map = new Map<string, number>();

    filteredData.forEach((r) => {
      map.set(r.agent, (map.get(r.agent) ?? 0) + r.chat_breached);
    });

    return Array.from(map.values()).filter((v) => v > 1).length;
  }, [filteredData]);

  const topSupervisors = useMemo(
    () => getTopByField(filteredData, "supervisor", isDailySummary),
    [filteredData, isDailySummary]
  );

  const topCoordinators = useMemo(
    () =>
      !hour
        ? getTopByField(filteredData, "coordinator", isDailySummary)
        : [],
    [filteredData, hour, isDailySummary]
  );

  const buildClipboardText = () => {
    const zoneLabel = zone === "PE" ? "HP" : "HE";

    let text = bold(`📌 Chats Vencidos | `);

    if (isDailySummary) {
      text += bold(`Resumen diario - ${zoneLabel}\n\n`);
    } else {
      text += bold(`${hour ? `Tramo ${hour} - ${hour.slice(0, 2)}:59` : ""} ${zoneLabel}\n\n`);
    }

    text += `⚠️ ${agentsWithBreached} As presentan más de 1 chat vencido.\n`;
    text += `🚨 ${totalChats} chats fuera de SLA en el tramo.\n\n`;

    text += bold(`Top Supervisores con mayor impacto:\n\n`);
    topSupervisors.forEach(([name, total]) => {
      text += `${name}: ${total} casos fuera de SLA\n`;
    });

    if (!hour && topCoordinators.length) {
      text += `\nTop Responsables\n`;
      topCoordinators.forEach(([name, total]) => {
        text += `${name}: ${total} casos fuera de SLA\n`;
      });
    }

    text += bold(`\n🚨Solicitamos su apoyo reforzando los tiempos de saludo para reducir los vencimientos.🚨`);

    return text;
  };

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-3 mb-4 w-[80%] mx-auto">
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          {TEAMS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <select value={hour} onChange={(e) => setHour(e.target.value)}>
          <option value="">Todas las horas</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>


        <select value={zone} onChange={(e) => setZone(e.target.value as Zone)}>
          {ZONES.map((z) => (
            <option key={z.value} value={z.value}>
              {z.label}
            </option>
          ))}
        </select>

      </div>

      <div className="flex gap-2 mb-3 w-[80%] mx-auto">
        <CopyImageButton
          targetId="sla-breached-table"
          label="📸 Copiar tabla"
        />

        <button
          className="border px-3 py-1"
          onClick={() =>
            navigator.clipboard.writeText(buildClipboardText())
          }
        >
          📋 Copiar resumen
        </button>
        <UploadSlaBreachedButton onAfterUpload={() => {fetchReport(true)}}/>
      </div>
      {
        hour && (
          <div id="sla-breached-table" className="w-[80%] mx-auto py-4">
            <table className="w-full border">
              <thead>
                <tr>
                  <th> Hora ({zone === "PE" ? "Perú" : "España"})</th>
                  <th>Agente</th>
                  <th>Supervisor</th>
                  <th>Coordinator</th>
                  <th>Chats Breached</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className={`${row.chat_breached > 1 ? 'text-red-500' : ''} text-center`}>
                    <td>{zone === "PE" ? row.interval_pe : row.interval_es}</td>
                    <td>{row.agent}</td>
                    <td>{row.supervisor}</td>
                    <td>{row.coordinator ?? "-"}</td>
                    <td>{row.chat_breached}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      {!hour && date && team && (
        <DailyCoordinatorSummary data={filteredData} />
      )}
    </>
  );
};
