"use client";

import { CopyImageButton } from "@/components/utils/CopyImagenButton";
import { GroupByCoordinatorAndSupervisor } from "./groupByCoordinatorAndSupervisor";

interface Props {
  data: any[];
}

export const DailyCoordinatorSummary = ({ data }: Props) => {
  const grouped = GroupByCoordinatorAndSupervisor(data);

  if (!grouped.length) return null;

  return (
    <section className="w-[80%] mx-auto mt-6">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg">
          📊 Resumen Diario por Coordinador
        </h3>

        <CopyImageButton
          targetId="daily-coordinator-summary"
          label="📸 Copiar resumen"
        />
      </div>

      <div id="daily-coordinator-summary" className="bg-white p-4 border rounded">
        {grouped.map(({ coordinator, supervisors }) => {
          const coordinatorTotal = supervisors.reduce(
            (acc, s) => acc + s.total,
            0
          );

          return (
            <table key={coordinator} className="w-full mb-6 border">
              <thead>
                <tr className="bg-gray-100">
                  <th colSpan={2} className="text-center px-2 py-1">
                    {coordinator}
                  </th>
                </tr>
                <tr>
                  <th className="border">Supervisor</th>
                  <th className="border">Chats Breached</th>
                </tr>
              </thead>

              <tbody>
                {supervisors.map((s) => (
                  <tr key={s.supervisor} className="text-center">
                    <td className="border">{s.supervisor}</td>
                    <td className="border">{s.total}</td>
                  </tr>
                ))}

                {/* 👇 Fila TOTAL */}
                <tr className="font-semibold bg-gray-50 text-center">
                  <td className="border">Total</td>
                  <td className="border text-red-700">{coordinatorTotal}</td>
                </tr>
              </tbody>
            </table>
          );
        })}
      </div>
    </section>
  );
};
