import React, { useMemo } from "react";
import { useWorkersStore } from "@/components/store/workerStore";
import { getRelativeDates } from "@/components/utils/UtilsForTime";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersDateFilter = () => {
  const filterDate = useWorkersStore(s => s.filterDate);
  const setFilterDate = useWorkersStore(s => s.setFilterDate);

  const dateOptions = useMemo(
    () =>
      getRelativeDates().map(date => ({
        label: date,
        value: date,
      })),
    []
  );

  return (
    <SelectFilter
      label="Filter by Date"
      value={filterDate}
      onChange={setFilterDate}
      options={dateOptions}
    />
  );
};

export default WorkersDateFilter;
