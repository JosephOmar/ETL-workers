// hooks/useWorkerMatch.ts
import { useMemo } from "react";
import { useWorkersStore } from "@/components/store/workerStore";
import type { Worker } from "@/components/types/worker.type";
import { normalizeWorkerInput } from "@/components/utils/UtilsForText";

export function useWorkerMatch(nameInput: string): Worker | undefined {
  const { workers } = useWorkersStore();

  return useMemo(() => {
    if (!nameInput.trim()) return undefined;

    const normalized = normalizeWorkerInput(nameInput);

    return workers.find(
      (w) =>
        w.name?.toLowerCase() === normalized ||
        w.api_email?.toLowerCase() === normalized
    );
  }, [nameInput, workers]);
}

export function useWorkerExtraction(
  worker?: Worker,
  timeInput?: string
) {
  const extract = () => {
    if (!worker) return null;

    const ct = worker.contract_type?.name;
    const contractLabel =
      ct === "Full Time" || ct === "Part Time"
        ? "Concentrix"
        : "Ubycall";

    let diffSec = 0;
    let hmsStr = "00:00:00";

    if (timeInput) {
      const now = new Date();
      const m = timeInput.match(/(\d{1,2}:\d{2}(?::\d{2})?\s?(AM|PM))/i);

      if (m) {
        let [hms, meridiem] = m[1].split(" ");
        let [hh, mm, ss = 0] = hms.split(":").map(Number);

        if (meridiem === "PM" && hh < 12) hh += 12;
        if (meridiem === "AM" && hh === 12) hh = 0;

        const inputDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hh,
          mm,
          Number(ss)
        );

        diffSec = Math.max(
          0,
          Math.floor((now.getTime() - inputDate.getTime()) / 1000)
        );

        const h = Math.floor(diffSec / 3600);
        const m2 = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;

        hmsStr = [h, m2, s]
          .map(v => v.toString().padStart(2, "0"))
          .join(":");
      }
    }

    return { worker, contractLabel, diffSec, hmsStr };
  };

  return { extract };
}
