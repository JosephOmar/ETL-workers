import { useWorkersStore } from "@/components/store/workerStore";
import { generateHalfHourSlots } from "@/components/utils/components/HalfHourSlots";
import clsx from "clsx";

const slots = generateHalfHourSlots();

const WorkersTimeRangeFilter = () => {
  const selected = useWorkersStore(s => s.filterTimeRange);
  const setTime = useWorkersStore(s => s.setFilterTimeRange);
  console.log(selected)
  return (
    <div>
      <label className="block mb-2 font-medium">
        Filter by Time Range
      </label>

      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
        {slots.map(time => {
          const isActive = selected.includes(time);

          return (
            <button
              key={time}
              type="button"
              onClick={() => setTime(time)}
              className={clsx(
                "text-sm px-2 py-1 rounded border",
                isActive
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white hover:bg-gray-100"
              )}
            >
              {time}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {selected.join(" → ")}
        </p>
      )}
    </div>
  );
};

export default WorkersTimeRangeFilter;
