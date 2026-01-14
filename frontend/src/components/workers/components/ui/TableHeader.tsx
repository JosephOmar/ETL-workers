import type { Column } from "@/components/types/table-column";
import type { Worker } from "@/components/types/worker.type";

type TableHeaderProps<T> = {
  columns: Column<T>[];
  sortKey: string | null;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
};

export const TableHeader = <T,>({
  columns,
  sortKey,
  sortDirection,
  onSort,
}: TableHeaderProps<T>) => (
  <thead className="bg-gray-200">
    <tr>
      {columns.map((col) => (
        <th
          key={col.key}
          onClick={() => col.sortable && onSort(col.key)}
          className={`px-4 py-2 text-left ${col.sortable ? "cursor-pointer select-none" : ""}`}
        >
          {col.header}
          {sortKey === col.key && (sortDirection === "asc" ? " ▲" : " ▼")}
        </th>
      ))}
    </tr>
  </thead>
);
