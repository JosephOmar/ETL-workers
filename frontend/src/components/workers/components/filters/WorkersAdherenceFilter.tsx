import { useWorkersStore } from "@/components/store/workerStore";

const WorkersAdherenceFilter = () => {
  const filterAdherenceBelow = useWorkersStore(s => s.filterAdherenceBelow);
  const setFilterAdherenceBelow = useWorkersStore(s => s.setFilterAdherenceBelow);

  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={filterAdherenceBelow}
        onChange={(e) => setFilterAdherenceBelow(e.target.checked)}
      />
      Show adherence &lt; 90%
    </label>
  );
};

export default WorkersAdherenceFilter;