import { useMemo, useState } from "react";
import type { THTHighIntervalSupervisor } from "@/components/types/tht-high-agent.type";
import { CopyImageButton } from "@/components/utils/CopyImagenButton";

type Props = {
  data: THTHighIntervalSupervisor[];
  loading: boolean;
  team: string;
  interval: string;
  zone: string;
};

export const THTHighSupervisorsTable = ({ data, loading, team, interval, zone }: Props) => {
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) =>
      sort === "asc" ? a.count - b.count : b.count - a.count
    );
  }, [data, sort]);

  if (loading) return null;

  return (
    <div className="w-[80%] mx-auto">
      <CopyImageButton targetId="tht-high-supervisor" />
      <div id="tht-high-supervisor">
        <h3 className="font-bold mb-2">📌 THT Alto por Supervisor</h3>
        <table className="w-full border">
          <thead>
            <tr>
              <th colSpan={3}>{team} - {interval} {zone}</th>
            </tr>
            <tr>
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
