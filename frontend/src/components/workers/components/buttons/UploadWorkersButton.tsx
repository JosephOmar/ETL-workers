import { UploadFilesDialog } from "@/components/utils/uploadFiles/UploadFilesDialog";
import { BACKEND_URL } from "@/config/env";

export function UploadWorkersButton({
  onAfterUpload,
}: {
  onAfterUpload?: () => void;
}) {
  return (
    <UploadFilesDialog
      backendUrl={BACKEND_URL}
      endpoint="upload-workers/"
      title="Upload Workers Files"
      description="You must upload the 4 mandatory files to process the workers"
      buttonText="Upload Workers"
      fields={[
        { key: "peopleActive", label: "people_active" },
        { key: "peopleInactive", label: "people_inactive" },
        { key: "schedulingPPP", label: "scheduling_ppp" },
        { key: "apiID", label: "api_id" },
        { key: "schedulingUbycall", label: "scheduling_ubycall" },
        { key: "masterGlovo", label: "master_glovo" },
      ]}
      onAfterUpload={onAfterUpload}
    />
  );
}
