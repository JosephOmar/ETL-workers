import { useWorkerMatch } from "./hookAlerts";
import { useState, useEffect } from "react";
import { useWorkerExtraction } from "./hookAlerts";
import type { ActionConfig } from "@/components/types/alerts.type";
import { WorkerForm } from "./AlertsWorkerForm";
import { ActionsGrid } from "./ActionsGrid";
import { ALERTS_ACTIONS } from "./configButtons";
import { useWorkersStore } from "@/components/store/workerStore";

export const AlertsContainer: React.FC = () => {
  const [nameInput, setNameInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  const { fetchWorkers, loading } = useWorkersStore();

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const matchingWorker = useWorkerMatch(nameInput);

  const { extract } = useWorkerExtraction(matchingWorker, timeInput);

  const handleAction = (builder: ActionConfig["builder"]) => {
    const data = extract();
    if (!data) return;

    const message = builder({
      ...data,
      url: urlInput,
    });

    navigator.clipboard.writeText(message).catch(() => {
      alert("Error al copiar el mensaje");
    });
  };

  return (
    <div>
      <h2 className="p-6 text-center text-4xl font-bold">Alerts</h2>

      <div className="p-4 space-y-4 text-xs">
        <WorkerForm
          nameInput={nameInput}
          setNameInput={setNameInput}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          timeInput={timeInput}
          setTimeInput={setTimeInput}
          matchingWorker={matchingWorker}
        />

        <ActionsGrid
          actions={ALERTS_ACTIONS}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};
