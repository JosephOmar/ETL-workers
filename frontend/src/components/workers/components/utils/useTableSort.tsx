import { useState, useMemo } from "react";

export const useTableSort = <T,>(
  data: T[],
  columns: {
    key: string;
    sortValue?: (row: T) => any;
  }[]
) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedWorkers = useMemo(() => {
    if (!sortKey) return data;

    const column = columns.find(c => c.key === sortKey);
    if (!column?.sortValue) return data;

    return [...data].sort((a, b) => {
      const aVal = column.sortValue!(a);
      const bVal = column.sortValue!(b);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection, columns]);

  const onSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return { sortedWorkers, sortKey, sortDirection, onSort };
};
