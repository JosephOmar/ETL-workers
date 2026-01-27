// components/charts/DeviationReasonDonut.tsx
"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import type { DeviationReasonDonut } from "@/components/types/adherence-report.type";
import ChartDataLabels from "chartjs-plugin-datalabels";
interface Props {
  dataChart: DeviationReasonDonut[];
}

export const DeviationReasonDonutChart: React.FC<Props> = ({ dataChart }) => {

  const total = dataChart.reduce((acc, item) => acc + item.agents_count, 0);
  const data = {
    labels: dataChart.map((data) => data.main_deviation_reason),
    datasets: [
      {
        label: "Razones de desviación",
        data: dataChart.map((data) => data.agents_count),
        backgroundColor: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"],
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
        formatter: (value: number) => {
          if (!total) return "0%";
          const percent = ((value / total) * 100).toFixed(0);
          return `${percent}%`;
        },
        font: {
          weight: "bold" as const,
          size: 18,
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow w-[400px] h-[400px] mx-auto">
      <h3 className="text-lg font-semibold mb-2"></h3>
      <Pie data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};
