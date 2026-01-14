import { useWorkersStore } from "@/components/store/workerStore";
import { ATTENDANCE_OPTIONS } from "@/components/utils/Constans";
import SelectFilter from "@/components/utils/FIlter/SelectFilter";

const WorkersAttendanceFilter = () => {
  const filterAttendance = useWorkersStore(s => s.filterAttendance);
  const setFilterAttendance = useWorkersStore(s => s.setFilterAttendance);

  return (
    <SelectFilter
      label="Filter by Attendance"
      value={filterAttendance}
      onChange={setFilterAttendance}
      options={ATTENDANCE_OPTIONS}
      multiple
      className=""
    />
  );
};

export default WorkersAttendanceFilter;
