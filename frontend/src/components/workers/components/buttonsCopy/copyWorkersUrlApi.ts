import { copyToClipboard } from "../../../utils/copyToClipboard";
import type { Worker } from "@/components/types/worker.type";

export const copyWorkerUrlApi = (workers: Worker[]) => {
  const baseUrl =
    "https://glovo-eu.deliveryherocare.com/supervisor/agent-monitor?filter.agent.ids=";

  const apiIds = workers
    .map(w => w.api_id)
    .filter(Boolean);

  if (!apiIds.length) return;

  copyToClipboard<null>(
    [null],
    () => [
      baseUrl + apiIds.join("%2C")
    ]
  );
};
