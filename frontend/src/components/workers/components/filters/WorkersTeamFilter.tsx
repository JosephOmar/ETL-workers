import { useWorkersStore } from "@/components/store/workerStore";
import { TEAM_OPTIONS } from "@/components/utils/Constans";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersTeamFilter = () => {
  const filterTeams = useWorkersStore(s => s.filterTeams);
  const setFilterTeams = useWorkersStore(s => s.setFilterTeams);

  return (
    <SelectFilter
      label="Filter by Team"
      value={filterTeams}
      onChange={setFilterTeams}
      options={TEAM_OPTIONS}
      multiple
      className=""
    />
  );
};

export default WorkersTeamFilter;
