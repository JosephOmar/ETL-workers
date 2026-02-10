import type { SlaBreachedInterval } from "@/components/types/sla-breached-report.type";

interface Props {
  intervals: SlaBreachedInterval[];
  zone: "PE" | "ES";
  loading: boolean;
}

export const SlaBreachedMainTable = ({ intervals, zone, loading }: Props) => {
  if (loading) return <p>Cargando...</p>;

  return (
    <table className="w-[80%] mx-auto mb-6 border">
      <thead>
        <tr className="bg-gray-100">
          <th>Team</th>
          <th>Intervalo</th>
          <th>Total agentes</th>
          <th>Total supervisores</th>
          <th>Chats breached</th>
        </tr>
      </thead>
      <tbody>
        {intervals.map((i) => {
          const totalBreached =
            i.agents.reduce((a, b) => a + b.chat_breached, 0) +
            i.supervisors.reduce((a, b) => a + b.chat_breached, 0);

          return (
            <tr key={`${i.team}-${i.interval_pe}`} className="text-center">
              <td>{i.team}</td>
              <td>{zone === "PE" ? i.interval_pe : i.interval_es}</td>
              <td>{i.agents.length}</td>
              <td>{i.supervisors.length}</td>
              <td className="font-bold">{totalBreached}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
