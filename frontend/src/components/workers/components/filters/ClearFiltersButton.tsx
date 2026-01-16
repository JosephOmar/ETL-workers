import { Button } from "@components/ui/button";
import { useWorkersStore } from "@/components/store/workerStore";

export const ClearFiltersButton = () => {
  const resetFilters = useWorkersStore((s) => s.resetFilters);

  return (
    <Button
      onClick={resetFilters}
      variant="outline"
      className="btn-grad"
    >
      Clean Filters
    </Button>
  );
};