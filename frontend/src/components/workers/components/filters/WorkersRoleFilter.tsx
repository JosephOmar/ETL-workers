import { useWorkersStore } from "@/components/store/workerStore";
import { ROLE_OPTIONS } from "@/components/utils/Constans";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersRoleFilter = () => {
  const filterRole = useWorkersStore(s => s.filterRole);
  const setFilterRole = useWorkersStore(s => s.setFilterRole);

  return (
    <SelectFilter
      label="Filter by Role"
      value={filterRole}
      onChange={setFilterRole}
      options={ROLE_OPTIONS}
      multiple
      className=""
    />
  );
};

export default WorkersRoleFilter;
