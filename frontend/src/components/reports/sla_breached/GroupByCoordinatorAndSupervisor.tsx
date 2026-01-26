type GroupedCoordinator = {
  coordinator: string;
  supervisors: {
    supervisor: string;
    total: number;
  }[];
};

export const GroupByCoordinatorAndSupervisor = (data: any[]): GroupedCoordinator[] => {
  const map = new Map<string, Map<string, number>>();

  data.forEach((row) => {
    if (!row.coordinator || !row.supervisor) return;

    if (!map.has(row.coordinator)) {
      map.set(row.coordinator, new Map());
    }

    const supervisorMap = map.get(row.coordinator)!;
    supervisorMap.set(
      row.supervisor,
      (supervisorMap.get(row.supervisor) ?? 0) + row.chat_breached
    );
  });

  return Array.from(map.entries()).map(([coordinator, supervisorsMap]) => ({
    coordinator,
    supervisors: Array.from(supervisorsMap.entries())
      .map(([supervisor, total]) => ({ supervisor, total }))
      .sort((a, b) => b.total - a.total),
  }));
};