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

import type { Worker } from "@/components/types/worker.type";
import type { SearchField } from "@/components/types/table-column";
import { parseBulkInput } from "@/components/utils/UtilsForText";

export const sortByBulkOrder =
  (searchText: string, field: SearchField) =>
  (a: Worker, b: Worker) => {

    if (!searchText.trim()) return 0;

    const values = parseBulkInput(searchText)
      .map(v => v.toLowerCase());

    const orderMap = new Map(
      values.map((v, i) => [v, i])
    );

    const getKey = (w: Worker) => {
      if (field === "document") return w.document?.toLowerCase();
      if (field === "email") return w.api_email?.toLowerCase();
      return w.name?.toLowerCase();
    };

    const indexA = orderMap.get(getKey(a) ?? "");
    const indexB = orderMap.get(getKey(b) ?? "");

    if (indexA === undefined && indexB === undefined) return 0;
    if (indexA === undefined) return 1;
    if (indexB === undefined) return -1;

    return indexA - indexB;
  };
