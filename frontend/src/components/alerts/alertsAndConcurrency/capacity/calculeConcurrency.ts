import { getMaxConcurrency } from "./utils";

export function buildCapacityText(
  team: string,
  agents: number,
  tickets: number,
  backlog: number
): string {
  const concurrency = parseFloat((tickets / agents).toFixed(2));

  const concurrencyMax = team === "Rider Tier1" ? 3 : 2;

  if (concurrency > concurrencyMax) {
    return (
      `Capacidad: ${team}\n\n` +
      `Total de Agentes: ${agents}\n` +
      `Tickets: ${tickets}\n` +
      `Concurrencia: ${concurrencyMax}\n\n` +
      (backlog > 0
        ? `Tenemos ${backlog} casos en espera`
        : `No tenemos agentes disponibles para nuevos casos`)
    );
  }

  const available = calculateAvailableAgents(team, agents, tickets);
  const RealAvailable = available > 30 ? 30 : available;
  const textRealAvailable = available === 0 ? `❌ Sin agentes disponibles para refuerzo` : `Ag. Disponibles: ${RealAvailable} para refuerzo`
  return (
    `Capacidad: ${team}\n\n` +
    `Total de Agentes: ${agents} Agentes.\n` +
    `Tickets: ${tickets} Tickets en gestión\n` +
    `Concurrencia: ${concurrency}\n\n` +
    textRealAvailable
  );
}

export function buildAvailabilityLine(
  label: string,
  concurrency: number,
  removable: number
) {
  return `➡️ ${label} - Concurrencia: ${concurrency}. Se tiene disponibilidad para sacar ${removable} agentes para refuerzos.`;
}

export function calculateAvailableAgents(
  team: string,
  agents: number,
  tickets: number
): number {
  if (agents === 0) return 0;
  if (agents <= 6) return 1;
  const maxAllowed = getMaxConcurrency(team, agents);

  const neededAgents = Math.ceil(tickets / maxAllowed);

  return Math.max(agents - neededAgents, 0);
}