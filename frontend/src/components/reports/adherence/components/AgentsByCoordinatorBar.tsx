// components/charts/AgentsByCoordinatorBar.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import type { AgentsBelow90ByCoordinator } from "@/components/types/adherence-report.type";

interface Props {
  dataChart: AgentsBelow90ByCoordinator[];
}

export const AgentsByCoordinatorBar: React.FC<Props> = ({ dataChart }) => {

  const data = {
    labels: dataChart.map((data) => data.coordinator),
    datasets: [
      {
        label: "Agents With Adherence < 90%",
        data: dataChart.map((data) => data.agents_below_90),
        backgroundColor: "#fbbf24",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" as const },
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
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow max-h-[40vh]">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Bar data={data} options={options} />
    </div>
  );
};
