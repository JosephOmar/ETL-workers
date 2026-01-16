import { useWorkersStore } from "@/components/store/workerStore";
import { generateHalfHourSlots } from "@/components/utils/components/HalfHourSlots";
import clsx from "clsx";

const slots = generateHalfHourSlots();

const WorkersTimeRangeFilter = () => {
  const selected = useWorkersStore(s => s.filterTimeRange);
  const setTime = useWorkersStore(s => s.setFilterTimeRange);

  return (
    <div className="col-span-2">
      <label className="block mb-2 font-medium">
        Filter by Time
      </label>

      <div className="grid grid-cols-10 gap-2">
        {slots.map(time => {
          const isActive = selected === time;

          return (
            <button
              key={time}
              type="button"
              onClick={() => setTime(isActive ? null : time)}
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

      {selected && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: {selected}
        </p>
      )}
    </div>
  );
};

export default WorkersTimeRangeFilter;
