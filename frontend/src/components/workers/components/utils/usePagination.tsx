import { useState, useMemo } from "react";

export const usePagination = <T,>(data: T[], pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  return {
    currentPage,
    totalPages,
    pageData,
    next: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prev: () => setCurrentPage(p => Math.max(p - 1, 1)),
  };
};