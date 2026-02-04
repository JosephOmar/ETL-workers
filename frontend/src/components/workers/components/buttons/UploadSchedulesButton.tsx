import { UploadFilesDialog } from "@/components/utils/uploadFiles/UploadFilesDialog";
import { BACKEND_URL } from "@/config/env";

export function UploadSchedulesButton({
  onAfterUpload,
}: {
  onAfterUpload?: () => void;
}) {
  return (
    <UploadFilesDialog
      backendUrl={BACKEND_URL}
      endpoint="upload-schedules/"
      title="Upload Schedules Files"
      description="You must upload the 2 mandatory files to process the workers"
      buttonText="Upload Schedules"
      fields={[
        { key: "peopleObs", label: "people_obs" },
        { key: "scheduleConcentrix", label: "schedule_concentrix" },
        { key: "scheduleUbycall", label: "schedule_ubycall" },
        { key: "schedulePPP", label: "schedule_ppp" },
      ]}
      onAfterUpload={onAfterUpload}
    />
  );
}