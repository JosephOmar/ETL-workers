import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";

export const copyWorkersEmailAndTL = (workers: Worker[]) => {
  copyToClipboard<Worker>(
    workers,
    (w) => {
      return [
        w.document,
        w.api_email,
        w.name,
        w.supervisor,
        w.coordinator,
      ];
    },
    {
      includeHeader: true,
      header: ["document","email","nombre","supervisor","coordinator"]
    }
  );
};
