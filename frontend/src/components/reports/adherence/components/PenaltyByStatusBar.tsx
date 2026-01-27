// components/charts/PenaltyByStatusBar.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import type { PenaltyByStatus } from "@/components/types/adherence-report.type";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface Props {
  dataChart: PenaltyByStatus[];
}

export const PenaltyByStatusBar: React.FC<Props> = ({ dataChart }) => {

  const data = {
    labels: dataChart.map((data) => data.adherence_status),
    datasets: [
      {
        label: "Average Time Out of Adherence (Minutes)",
        data: dataChart.map((data) => data.avg_penalty_minutes),
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
        formatter: (value: number) => {
          const num = Number(value);
          if (isNaN(num)) return "0";
          return num.toFixed(0);
        },
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
