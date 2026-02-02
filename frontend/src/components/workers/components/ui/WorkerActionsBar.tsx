import { useWorkersStore } from "@/components/store/workerStore";
import { TruncateWorkersButton } from "../buttons/TruncateWorkersButton";
import { UploadAttendanceButton } from "../buttons/UploadAttendanceButton";
import { UploadWorkersButton } from "../buttons/UploadWorkersButton";
import { UploadSchedulesButton } from "../buttons/UploadSchedulesButton";
import FilesForUploadWorkersButton from "../buttons/FilesForUploadWorkersButton";
import UpdateWorkersButton from "../buttons/UpdateWorkersButton";

export const WorkersActionsBar = () => {
  const refresh = () =>
    useWorkersStore.getState().fetchWorkers(true);

  return (
    <div className="flex gap-3 mb-4">
      {/* <TruncateWorkersButton onAfterTruncate={refresh} /> */}
      <UploadWorkersButton onAfterUpload={refresh} />
      <UploadSchedulesButton onAfterUpload={refresh} />
      <UploadAttendanceButton onAfterUpload={refresh} />
      <FilesForUploadWorkersButton />
      <UpdateWorkersButton onAfterUpdate={refresh} />
    </div>
  );
};
