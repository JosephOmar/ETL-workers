import { useWorkersStore } from "@/components/store/workerStore";

const WorkersProductiveFilter = () => {
  const filterProductive = useWorkersStore(s => s.filterProductive);
  const setFilterProductive = useWorkersStore(s => s.setFilterProductive);

  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={filterProductive}
        onChange={(e) => setFilterProductive(e.target.checked)}
      />
      Show productive
    </label>
  );
};

export default WorkersProductiveFilter;