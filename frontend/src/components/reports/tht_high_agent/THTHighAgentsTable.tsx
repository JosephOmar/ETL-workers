import { useMemo, useState } from "react";
import type { THTHighIntervalAgent } from "@/components/types/tht-high-agent.type";
import { CopyImageButton } from "@/components/utils/CopyImagenButton";

type Props = {
  data: THTHighIntervalAgent[];
  loading: boolean;
  interval: string;
  team: string;
  zone: string;
};

export const THTHighAgentsTable = ({ data, loading, interval, team, zone }: Props) => {
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) =>
      sort === "asc" ? a.count - b.count : b.count - a.count
    );
  }, [data, sort]);

  if (loading) return <p className="text-center">Cargando...</p>;

  return (
    <div className="w-[80%] mx-auto mb-8">
      <CopyImageButton targetId="tht-high-agent" />
      <div id="tht-high-agent">
        <h3 className="font-bold mb-2">📌 THT Alto por Agente</h3>
        <table className="w-full border">
          <thead>
            <tr>
              <th>{team} - {interval} {zone}</th>
            </tr>
            <tr>
              <th>Agente</th>
              <th>Supervisor</th>
              <th>Coordinator</th>
              <th onClick={() => setSort(sort === "asc" ? "desc" : "asc")}>
                THT {sort === "asc" ? "⬆️" : "⬇️"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={i} className="text-center">
                <td>{r.name ?? "-"}</td>
                <td>{r.supervisor ?? "-"}</td>
                <td>{r.coordinator ?? "-"}</td>
                <td className="text-red-500">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
