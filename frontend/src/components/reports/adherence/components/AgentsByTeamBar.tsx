"use client";
import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Chart } from "react-chartjs-2"; 
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Props {
  agents: AgentAdherenceRow[];
}

export const AgentsByTeamBar: React.FC<Props> = ({ agents }) => {
  // ⚡ Orden fijo que quieres mostrar
  const teamOrder = [
    "Customer Tier1",
    "Customer Tier2",
    "Rider Tier1",
    "Rider Tier2",
    "Vendor Tier1",
    "Vendor Tier2",
    "Vendor Chat",
  ];

  // Mapear datos respetando el orden
  const counts = teamOrder.map((team) => {
    const teamAgents = agents.filter((a) => a.team === team);
    const below90 = teamAgents.filter((a) => a.adherence < 90).length;
    return { team, below90, total: teamAgents.length };
  });

  const data: ChartData<"bar" | "line", number[], string> = {
    labels: counts.map((c) => c.team),
    datasets: [
      {
        type: "bar" as const,
        label: "Adherence < 90%",
        data: counts.map((c) => c.below90),
        backgroundColor: "#fbbf24",
        yAxisID: "left",
      },
      {
        type: "bar" as const, 
        label: "Total Agents",
        data: counts.map((c) => c.total),
        backgroundColor: "#60a5fa",
        yAxisID: "left",
      },
      {
        type: "line" as const,
        label: "% Agents < 90%",
        data: counts.map((c) => Number(((c.below90 / c.total) * 100).toFixed(1))),
        borderColor: "#f87171",
        borderWidth: 2,
        yAxisID: "percent",
        tension: 0.3,
        pointBackgroundColor: "#f87171",
      },
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    scales: {
      left: { beginAtZero: true, position: "left", title: { display: true, text: "Agents" } },
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
