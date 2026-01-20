import { buildFirstLine } from "./helper";
import { buildSupervisorLine } from "./helper";
import type { MessageBuilder, MessageBuilderNoTime } from "@/components/types/alerts.type";
import { bold } from "@/components/ui/toUnicodeBold";

export const buildWorkerNotResumeMessage: MessageBuilder = ({
  worker,
  contractLabel,
  diffSec,
  hmsStr,
  url,
}): string =>
  [
    buildFirstLine(worker, contractLabel),
    `🚨 ${bold(worker.name ?? "NOMBRE DESCONOCIDO")} no retoma el caso asignado`,
    `⏰ ${bold("Espera:")} ${diffSec}s (${hmsStr})`,
    `🔗 ${bold("Link:")} ${url}`,
    buildSupervisorLine(worker),
  ].join("\n");

export const buildElevatedThtChatMessage: MessageBuilder= ({
  worker,
  contractLabel,
  diffSec,
  hmsStr,
  url,
}): string =>
  [
    buildFirstLine(worker, contractLabel),
    `⚠️ ${bold(worker.name ?? "NOMBRE DESCONOCIDO")} con atención lenta en caso asignado`,
    `⏰ ${bold("Gestión:")} ${diffSec}s (${hmsStr})`,
    `🔗 ${bold("Link:")} ${url}`,
    buildSupervisorLine(worker),
  ].join("\n");

export const buildWorkerNotEndMessage: MessageBuilder = ({
  worker,
  contractLabel,
  diffSec,
  hmsStr,
  url,
}): string =>
  [
    buildFirstLine(worker, contractLabel),
    `🚨 ${bold(worker.name ?? "NOMBRE DESCONOCIDO")} no cierra el caso asignado`,
    `⏰ ${bold("Retoma:")} ${diffSec}s (${hmsStr})`,
    `🔗 ${bold("Link:")} ${url}`,
    buildSupervisorLine(worker),
  ].join("\n");

export const buildWorkerSendFirstGreetingMessage: MessageBuilderNoTime = ({
  worker,
  contractLabel,
  url,
}): string =>
  [
    buildFirstLine(worker, contractLabel),
    `🚨 ${bold(worker.name ?? "NOMBRE DESCONOCIDO")} sin saludo inicial`,
    `🔗 ${bold("Link:")} ${url}`,
    buildSupervisorLine(worker),
  ].join("\n");

export const buildWorkerOutSlaMessage: MessageBuilderNoTime = ({
  worker,
  contractLabel,
  url,
}): string =>
  [
    buildFirstLine(worker, contractLabel),
    `🚨 ${bold(worker.name ?? "NOMBRE DESCONOCIDO")} saludó fuera de tiempo (+30s)`,
    `🔗 ${bold("Link:")} ${url}`,
    buildSupervisorLine(worker),
  ].join("\n");
