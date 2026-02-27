import { useWorkersStore } from "@/components/store/workerStore";
import { STATUS_OPTIONS } from "@/components/utils/Constans";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersStatusFilter = () => {
  const filterStatus = useWorkersStore(s => s.filterStatus);
  const setFilterStatus = useWorkersStore(s => s.setFilterStatus);

  return (
    <SelectFilter
      label="Filter by Status"
      value={filterStatus}
      onChange={setFilterStatus}
      options={STATUS_OPTIONS}
      multiple
      className=""
    />
  );
};

export default WorkersStatusFilter;
