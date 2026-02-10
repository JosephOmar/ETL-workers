import type { SlaBreachedSupervisor } from "@/components/types/sla-breached-report.type";
import { CopyLinksButton } from "./CopyLinksButton";
import { CopyImageButton } from "@/components/utils/CopyImagenButton";
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
  zone
}: Props) => {
  if (loading) return <p>Cargando supervisores...</p>;

  return (
    <div className="w-[80%] mx-auto mb-6">
      <CopyImageButton targetId="table-sla-breached-supervisors"/>
      <table className="w-full" id="table-sla-breached-supervisors">
        <caption className="font-bold mb-2">
          Supervisores – {team} – {interval} - {zone}
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
    </div>
    
  );
};
