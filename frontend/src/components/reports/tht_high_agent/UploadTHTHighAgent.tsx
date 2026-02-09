import { UploadFilesDialog } from "@/components/utils/uploadFiles/UploadFilesDialog";
import { BACKEND_URL } from "@/config/env";

export function UploadTHTHighAgent({
  onAfterUpload,
}: {
  onAfterUpload?: () => void;
}) {
  return (
    <UploadFilesDialog
      backendUrl={BACKEND_URL}
      endpoint="upload-contacts-with-ccr/"
      title="Upload THT High Files"
      description="You must upload the mandatory file to process the tht high"
      buttonText="Upload THT High"
      fields={[
        { key: "contacts_with_ccr", label: "contacts_with_ccr" },
      ]}
      onAfterUpload={onAfterUpload}
    />
  );
}