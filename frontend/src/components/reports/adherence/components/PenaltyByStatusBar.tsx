// components/charts/PenaltyByStatusBar.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface Props {
  agents: AgentAdherenceRow[];
}

export const PenaltyByStatusBar: React.FC<Props> = ({ agents }) => {
  const statusBuckets = {
    Medium: [] as number[],
    High: [] as number[],
    Critical: [] as number[],
  };

  agents.forEach((a) => {
    if (a.adherence_status === "Medium") statusBuckets.Medium.push(a.penalty_minutes);
    else if (a.adherence_status === "High") statusBuckets.High.push(a.penalty_minutes);
    else if (a.adherence_status === "Critical") statusBuckets.Critical.push(a.penalty_minutes);
  });

  const data = {
    labels: ["Medium", "High", "Critical"],
    datasets: [
      {
        label: "Average Time Out of Adherence (Minutes)",
        data: [
          Math.round(statusBuckets.Medium.reduce((a, b) => a + b, 0) / (statusBuckets.Medium.length || 1)),
          Math.round(statusBuckets.High.reduce((a, b) => a + b, 0) / (statusBuckets.High.length || 1)),
          Math.round(statusBuckets.Critical.reduce((a, b) => a + b, 0) / (statusBuckets.Critical.length || 1)),
        ],
        backgroundColor: ["#34d399", "#60a5fa", "#f87171"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        color: "#000",
        formatter: (value: number) => `${value}`, // mostrar los minutos en la barra
        font: { weight: "bold" as const, size: 12 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow max-h-[40vh]">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
