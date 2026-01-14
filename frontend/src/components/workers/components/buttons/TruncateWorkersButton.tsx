import { ConfirmActionDialog } from "@/components/utils/uploadFiles/ConfirmActionDialog";
import { BACKEND_URL } from "@/config/env";

export function TruncateWorkersButton({ onAfterTruncate }: { onAfterTruncate?: () => void }) {
  return (
    <ConfirmActionDialog
      backendUrl={BACKEND_URL}
      endpoint="truncate-workers/"
      buttonText="Delete Workers"
      buttonVariant="destructive"
      dialogTitle="Are you sure?"
      dialogDescription="This action will delete all workers from the database. This action cannot be undone."
      confirmText="Yes, delete everything"
      successTitle="Truncated table"
      successDescription="All workers were successfully deleted"
      errorTitle="Error during truncate"
      errorDescription="Could not truncate the table"
      onSuccess={onAfterTruncate}
    />
  );
}
