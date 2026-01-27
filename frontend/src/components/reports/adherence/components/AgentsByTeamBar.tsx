"use client";
import React from "react";
import { Chart } from "react-chartjs-2"; 
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { AgentsBelow90ByTeam } from "@/components/types/adherence-report.type";
import type { ChartData, ChartOptions } from "chart.js";

interface Props {
  dataChart: AgentsBelow90ByTeam[];
}

export const AgentsByTeamBar: React.FC<Props> = ({ dataChart }) => {

  const data: ChartData<"bar" | "line", number[], string> = {
    labels: dataChart.map((data) => data.team),
    datasets: [
      {
        type: "bar" as const,
        label: "Adherence < 90%",
        data: dataChart.map((data) => data.agents_below_90),
        backgroundColor: "#fbbf24",
        yAxisID: "left",
        stack: "agents",
        order: 1,
      },
      {
        type: "bar" as const, 
        label: "Total Agents",
        data: dataChart.map((data) => data.total_agents),
        backgroundColor: "#60a5fa",
        yAxisID: "left",
        stack: "agents",
        order: 1,
      },
      {
        type: "line" as const,
        label: "% Agents < 90%",
        data: dataChart.map((data) => data.affected_pct),
        borderColor: "#f87171",
        borderWidth: 2,
        yAxisID: "percent",
        tension: 0.3,
        pointBackgroundColor: "#f87171",
        order: 0, 
      },
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    scales: {
      left: { beginAtZero: true, stacked: true, position: "left", title: { display: true, text: "Agents" } },
      x: {stacked: true,},
      percent: { beginAtZero: true, position: "right", title: { display: true, text: "% Agents < 90%" },
        ticks: { callback: (v) => `${v}%` }, grid: { drawOnChartArea: false } 
      },
    },
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        display: true,
        color: "#000",
        formatter: (value, context) => context.dataset.type === "line" ? `${value}%` : value,
        anchor: "end",
        align: "center",
        font: { weight: "bold" as const, size: 12 },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow max-h-[40vh]">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Chart type="bar" data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
