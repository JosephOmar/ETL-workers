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
    labels: ["Medium (90-80)", "High (80-70)", "Critical (<70)"],
    datasets: [
      {
        label: "Agentes",
        data: [statusBuckets.Medium, statusBuckets.High, statusBuckets.Critical],
        backgroundColor: ["#34d399", "#60a5fa", "#f87171"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const, // <--- tipado literal
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
  };

  return (
    <div id='agents-team-chart' className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Bar data={data} options={options} />
    </div>
  );
};
