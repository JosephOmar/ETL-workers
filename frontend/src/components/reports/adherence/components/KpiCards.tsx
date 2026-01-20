// components/charts/KpiCards.tsx
import React from "react";
import type { KPIBlock } from "@/components/types/adherence-report.type";

interface KpiCardsProps {
  kpis: KPIBlock;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded shadow">
      <div className="text-center">
        <p className="text-sm font-medium">Assisted Agents</p>
        <p className="text-2xl font-bold">{kpis.agents_evaluated}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Agents With Adherence &lt; 90%</p>
        <p className="text-2xl font-bold">{kpis.agents_below_90}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Critical Adhesion Agents (&lt; 70%)</p>
        <p className="text-2xl font-bold">{kpis.critical_agents}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Average Adherence</p>
        <p className="text-2xl font-bold">{kpis.avg_adherence.toFixed(2)}%</p>
      </div>
    </div>
  );
};