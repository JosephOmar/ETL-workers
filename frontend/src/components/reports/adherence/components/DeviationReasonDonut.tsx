// components/charts/DeviationReasonDonut.tsx
"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // <--- necesario para Pie / Doughnut
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registrar todos los elementos
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // <--- para Pie / Donut
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Props {
  agents: AgentAdherenceRow[];
}

export const DeviationReasonDonut: React.FC<Props> = ({ agents }) => {
  const filtered = agents.filter((a) => a.adherence < 90);

  const counts: Record<string, number> = {};
  filtered.forEach((a) => {
    if (a.main_deviation_reason) {
      counts[a.main_deviation_reason] = (counts[a.main_deviation_reason] || 0) + 1;
    }
  });

  const data = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Razones de desviación",
        data: Object.values(counts),
        backgroundColor: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        color: "#000",
        formatter: (value: number) => value,
        font: {
          weight: "bold" as const,
          size: 18,
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Pie data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
