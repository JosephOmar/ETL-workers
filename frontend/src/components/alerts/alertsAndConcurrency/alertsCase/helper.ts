import { bold } from "@components/ui/toUnicodeBold";
import type { Worker } from "@/components/types/worker.type";

export const buildFirstLine = (
  worker: Worker,
  contractLabel: string
): string => {
  const teamName = worker.team?.name ?? "EQUIPO";

  return worker.trainee === "DESPEGANDO"
    ? `${bold(`${teamName} - ${contractLabel} - ${worker.requirement_id ?? ""}`)}\n`
    : `${bold(`${teamName} - ${contractLabel}`)}\n`;
};

export const buildSupervisorLine = (worker: Worker): string => {
  const supervisor = bold(
    `\nTL: ${worker.supervisor ?? "-"}`
  );
  return supervisor;
};

export const getWorkerLabel = (worker: Worker) => {
  if (worker.trainee?.includes("DESPEGANDO")) {
    return `Despegando - ${worker.supervisor}`;
  }

  const ct = worker.contract_type.name;
  return ct.includes("FULL TIME") || ct.includes("PART TIME")
    ? `Agente Concentrix - ${worker.supervisor}`
    : `Agente Ubycall - ${worker.supervisor}`;
};