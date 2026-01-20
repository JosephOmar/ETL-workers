// components/charts/PenaltyByTeamTotalHoursBar.tsx
"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import type { AgentAdherenceRow } from "@/components/types/adherence-report.type";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface Props {
  agents: AgentAdherenceRow[];
}

export const PenaltyByTeamTotalHoursBar: React.FC<Props> = ({ agents }) => {
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

  // Sumar penalty_minutes por team y convertir a horas
  const totalHoursByTeam = teamOrder.map((team) => {
    const totalMinutes = agents
      .filter((a) => a.team === team)
      .filter((a) => a.adherence_status != 'Low')
      .reduce((sum, a) => sum + a.penalty_minutes, 0);
    return +(totalMinutes / 60).toFixed(2); // convertir a horas y redondear
  });

  const data = {
    labels: teamOrder,
    datasets: [
      {
        label: "Total Time Out of Adherence (Hours)",
        data: totalHoursByTeam,
        backgroundColor: "#f87171",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        anchor: "center" as const,  // dentro de la barra
        align: "center" as const,   // centrado
        color: "#000",              // blanco para que contraste con rojo
        formatter: (value: number) => `${value} h`,
        font: { weight: "bold" as const, size: 12 },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Hours" } },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow max-h-[40vh]">
      <h3 className="text-lg font-semibold mb-2">
      </h3>
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
