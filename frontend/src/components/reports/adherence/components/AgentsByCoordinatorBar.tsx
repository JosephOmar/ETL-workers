// components/charts/AgentsByCoordinatorBar.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  agents: AgentAdherenceRow[];
}

export const AgentsByCoordinatorBar: React.FC<Props> = ({ agents }) => {
  const coordinators = Array.from(new Set(agents.map((a) => a.coordinator).filter(Boolean)));

  const counts = coordinators.map((coord) => {
    const coordAgents = agents.filter((a) => a.coordinator === coord);
    const below90 = coordAgents.filter((a) => a.adherence < 90).length;
    return { coordinator: coord!, below90 };
  });

  const data = {
    labels: counts.map((c) => c.coordinator),
    datasets: [
      {
        label: "Agents With Adherence < 90%",
        data: counts.map((c) => c.below90),
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
