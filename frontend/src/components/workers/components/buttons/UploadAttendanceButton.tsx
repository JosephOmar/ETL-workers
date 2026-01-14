import { UploadFilesDialog } from "@/components/utils/uploadFiles/UploadFilesDialog";
import { BACKEND_URL } from "@/config/env";

export function UploadAttendanceButton({
  onAfterUpload,
}: {
  onAfterUpload?: () => void;
}) {
  return (
    <UploadFilesDialog
      backendUrl={BACKEND_URL}
      endpoint="upload-attendances/"
      title="Upload Attendance Files"
      description="You must upload the mandatory file to process the attendance"
      buttonText="Upload Attendance"
      fields={[
        { key: "attendance", label: "attendance" },
      ]}
      onAfterUpload={onAfterUpload}
    />
  );
}