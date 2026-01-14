import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;

  sortable?: boolean;
  sortValue?: (row: T) => string | number | null;
}

export type ZoneType = "PE" | "ES"

export type SortDirection = "asc" | "desc";

export type SearchField = "name" | "document" | "email";