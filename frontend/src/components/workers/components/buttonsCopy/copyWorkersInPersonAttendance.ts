import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";

export const copyWorkersInPersonAttendance = (workers: Worker[]) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      return [
        w.document,
        w.api_email
      ];
    },
    {
      includeHeader: true,
      header: ["document", "api email"]
    }
  );
};
