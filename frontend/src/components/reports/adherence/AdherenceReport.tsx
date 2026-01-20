// components/AdherenceReport.tsx
"use client";

import React, { useEffect } from "react";
import { useAdherenceReportStore } from "@/components/store/adherenceReportStore";
import { AdherenceReportAutoFetch } from "./ui/AdherenceReportAutoFetch";
import FetchAdherenceReportButton from "./ui/FetchAdherenceReportButton";
import { AdherenceReportFilters } from "./ui/AdherenceReportFilter";

import { KpiCards } from "./components/KpiCards";
import { AdherenceByStatusBar } from "./components/AdherenceByStatusBar";
import { AgentsByTeamBar } from "./components/AgentsByTeamBar";
import { DeviationReasonDonut } from "./components/DeviationReasonDonut";
import { PenaltyByStatusBar } from "./components/PenaltyByStatusBar";
import { AgentsByCoordinatorBar } from "./components/AgentsByCoordinatorBar";
import { ChartWrapper } from "@/components/utils/ChartCopyButton";
import { PenaltyByTeamTotalHoursBar } from "./components/PenaltyByTeamBar";

export const AdherenceReport = () => {
  const { report, fetchReport, loading, dateFrom, dateTo } = useAdherenceReportStore();

  useEffect(() => {
    fetchReport();
  }, [dateFrom, dateTo]);

  if (loading || !report) return <p>Cargando...</p>;

  return (
    <div className="flex justify-center py-8">
      <div className="w-[80%] space-y-8">
        <section>
          <AdherenceReportAutoFetch />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Adherence Report</h2>
            <FetchAdherenceReportButton forceRefresh />
          </div>
          <AdherenceReportFilters />
        </section>

        <h2 className="text-xl font-bold">
          Adherence Report: {dateFrom} to {dateTo}
        </h2>

        <ChartWrapper id="resumen-adherence-report" title="Resumen Adherence Report">
          <KpiCards kpis={report.kpis} />
        </ChartWrapper>

        <div className="grid grid-cols-2 gap-8">
          <ChartWrapper id="adherence-status-bar" title="Agents by Adherence Status">
            <AdherenceByStatusBar agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="agents-team-bar" title="Agentes by Team">
            <AgentsByTeamBar agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="deviation-reason-donut" title="Reasons for the deviation">
            <DeviationReasonDonut agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="penalty-status-bar" title="Average Time Out Of Adherence">
            <PenaltyByStatusBar agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="agents-coordinator-bar" title="Agents by Coordinator">
            <AgentsByCoordinatorBar agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="penalty-team-bar" title="Total Time Out Of Adherence by Team">
            <PenaltyByTeamTotalHoursBar agents={report.agents} />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
};
