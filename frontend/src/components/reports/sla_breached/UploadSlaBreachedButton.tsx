import { UploadFilesDialog } from "@/components/utils/uploadFiles/UploadFilesDialog";
import { BACKEND_URL } from "@/config/env";

export function UploadSlaBreachedButton({
  onAfterUpload,
}: {
  onAfterUpload?: () => void;
}) {
  return (
    <UploadFilesDialog
      backendUrl={BACKEND_URL}
      endpoint="upload-sla-breached/"
      title="Upload SLA Breched Files"
      description="You must upload the mandatory file to process the sla breached"
      buttonText="Upload SLA Breached"
      fields={[
        { key: "sla_breached", label: "sla_breached" },
      ]}
      onAfterUpload={onAfterUpload}
    />
  );
}