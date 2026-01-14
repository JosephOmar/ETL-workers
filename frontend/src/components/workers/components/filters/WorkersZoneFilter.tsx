import { useWorkersStore } from "@/components/store/workerStore";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";
import { ZONE_OPTIONS } from "@/components/utils/Constans";

const WorkersZoneFilter = () => {
  const filterZone = useWorkersStore(s => s.filterZone);
  const setFilterZone = useWorkersStore(s => s.setFilterZone);

  return (
    <SelectFilter
      label="Filter by Zone"
      value={filterZone}
      onChange={setFilterZone}
      options={ZONE_OPTIONS}
    />
  );
};

export default WorkersZoneFilter;
