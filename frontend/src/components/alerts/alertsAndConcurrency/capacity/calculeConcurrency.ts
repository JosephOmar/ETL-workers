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
  const RealAvailable = available > 10 ? 10 : available;

  return (
    `Capacidad: ${team}\n\n` +
    `Total de Agentes: ${agents} Agentes.\n` +
    `Tickets: ${tickets} Tickets en gestión\n` +
    `Concurrencia: ${concurrency}\n\n` +
    `Ag. Disponibles: ${RealAvailable} para refuerzo`
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

  const maxAllowed = getMaxConcurrency(team, agents);

  const neededAgents = Math.ceil(tickets / maxAllowed);

  return Math.max(agents - neededAgents, 0);
}
