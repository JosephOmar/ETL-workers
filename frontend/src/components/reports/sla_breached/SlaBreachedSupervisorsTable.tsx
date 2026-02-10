import type { SlaBreachedSupervisor } from "@/components/types/sla-breached-report.type";
import { CopyLinksButton } from "./CopyLinksButton";

interface Props {
  data: SlaBreachedSupervisor[];
  loading: boolean;
  interval: string;
  zone: "PE" | "ES";
  team: string;
}

export const SlaBreachedSupervisorsTable = ({
  data,
  loading,
  interval,
  team,
}: Props) => {
  if (loading) return <p>Cargando supervisores...</p>;

  return (
    <table className="w-[80%] mx-auto mb-6 border">
      <caption className="font-bold mb-2">
        Supervisores – {team} – {interval}
      </caption>
      <thead>
        <tr className="bg-gray-100">
          <th>Supervisor</th>
          <th>Coordinator</th>
          <th>Chats breached</th>
          <th>Links</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s, idx) => (
          <tr key={idx} className="text-center">
            <td>{s.supervisor}</td>
            <td>{s.coordinator}</td>
            <td className="font-bold">{s.chat_breached}</td>
            <td className="space-y-1">
              <CopyLinksButton links={s.links} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
