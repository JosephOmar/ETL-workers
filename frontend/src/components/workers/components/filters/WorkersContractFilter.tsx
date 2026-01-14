import { useWorkersStore } from "@/components/store/workerStore";
import { CONTRACT_OPTIONS } from "@/components/utils/Constans";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersContractFilter = () => {
  const filterContract = useWorkersStore(s => s.filterContract);
  const setFilterContract = useWorkersStore(s => s.setFilterContract);

  return (
    <SelectFilter
      label="Filter by Contract"
      value={filterContract}
      onChange={setFilterContract}
      options={CONTRACT_OPTIONS}
      multiple
      className=""
    />
  );
};

export default WorkersContractFilter;
