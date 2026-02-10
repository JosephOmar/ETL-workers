import type { SlaBreachedAgent } from "@/components/types/sla-breached-report.type";
import { CopyLinksButton } from "./CopyLinksButton";
import { CopyImageButton } from "@/components/utils/CopyImagenButton";
interface Props {
  data: SlaBreachedAgent[];
  loading: boolean;
  interval: string;
  zone: "PE" | "ES";
  team: string;
}

export const SlaBreachedAgentsTable = ({
  data,
  loading,
  interval,
  team,
  zone,
}: Props) => {
  if (loading) return <p>Cargando agentes...</p>;

  return (
    <div className="w-[80%] mx-auto mb-6">
      <CopyImageButton targetId="table-sla-breached-agents"/>
      <table className="w-full" id="table-sla-breached-agents">
        <caption className="font-bold mb-2">
          Agentes – {team} – {interval} - {zone}
        </caption>
        <thead>
          <tr className="bg-gray-100">
            <th>Agente</th>
            <th>Supervisor</th>
            <th>Chats breached</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a, idx) => (
            <tr key={idx} className="text-center">
              <td>{a.name ?? a.api_email}</td>
              <td>{a.supervisor}</td>
              <td className="font-bold">{a.chat_breached}</td>
              <td className="space-y-1">
                <CopyLinksButton links={a.links} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
