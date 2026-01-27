// components/charts/AdherenceByStatusBar.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";

interface Props {
  agents: AgentAdherenceRow[];
}

export const AdherenceByStatusBar: React.FC<Props> = ({ agents }) => {
  // Contar por Medium, High, Critical
  const statusBuckets = {
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  agents.forEach((a) => {
    if (a.adherence_status == 'Medium') statusBuckets.Medium++;
    else if (a.adherence_status == 'High') statusBuckets.High++;
    else if (a.adherence_status == 'Critical') statusBuckets.Critical++;
    else {}
  });

  const data = {
    labels: ["x ≤ 70%", "70% < x ≤ 80%", "80% < x ≤ 90%"],
    datasets: [
      {
        label: "Agentes",
        data: [statusBuckets.Critical, statusBuckets.High,  statusBuckets.Medium],
        backgroundColor: ["#f87171","#60a5fa","#34d399"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 16,
            weight: 600,
          },
          padding: 20,
          boxWidth: 20,
        },
      },
      datalabels: {
        color: "#000",
        formatter: (value: number) => value,
        font: {
          weight: "bold" as const,
          size: 14,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 16,       // 👈 tamaño de "Medium / High / Critical"
            weight: 600,    // opcional
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div id='agents-team-chart' className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Bar data={data} options={options} />
    </div>
  );
};
