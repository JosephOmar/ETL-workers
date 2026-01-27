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
import { DeviationReasonDonutChart } from "./components/DeviationReasonDonut";
import { PenaltyByStatusBar } from "./components/PenaltyByStatusBar";
import { AgentsByCoordinatorBar } from "./components/AgentsByCoordinatorBar";
import { ChartWrapper } from "@/components/utils/ChartCopyButton";
import { PenaltyByTeamTotalHoursBar } from "./components/PenaltyByTeamBar";
import "@/components/reports/utils/chartConfig"

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

        <ChartWrapper id="resumen-adherence-report" title="Adherence Report Summary">
          <KpiCards kpis={report.kpis} />
        </ChartWrapper>

        <div className="grid grid-cols-2 gap-8">
          <ChartWrapper id="adherence-status-bar" title="Agents by Percentaje Adherence">
            <AdherenceByStatusBar agents={report.agents} />
          </ChartWrapper>

          <ChartWrapper id="agents-team-bar" title="Agentes by Team">
            <AgentsByTeamBar dataChart={report.charts.agents_below_90_by_team} />
          </ChartWrapper>

          <ChartWrapper id="deviation-reason-donut" title="Reasons for the deviation">
            <DeviationReasonDonutChart dataChart={report.charts.deviation_reason_donut} />
          </ChartWrapper>

          <ChartWrapper id="penalty-status-bar" title="Average Time Out Of Adherence">
            <PenaltyByStatusBar dataChart={report.charts.penalty_by_status} />
          </ChartWrapper>

          <ChartWrapper id="agents-coordinator-bar" title="Agents by Coordinator">
            <AgentsByCoordinatorBar dataChart={report.charts.agents_below_90_by_coordinator} />
          </ChartWrapper>

          <ChartWrapper id="penalty-team-bar" title="Total Time Out Of Adherence by Team">
            <PenaltyByTeamTotalHoursBar agents={report.agents} />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
};
