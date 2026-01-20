import { getPeruRoundedTime } from "@/components/utils/UtilsForTime";

export const QUEUE_NAME_MAP: Record<string, string> = {
  "CS-case-inbox-spa-ES-tier2": "Customer Tier2",
  "RS-case-inbox-spa-ES-tier2": "Rider Tier2",
  "VS-case-inbox-spa-ES-tier2": "Vendor Tier2",

  "CS-chat-spa-ES-nonlive-order": "Customer Non Live",
  "CS-chat-spa-ES-live-order": "Customer Live",

  "RS-chat-spa-ES-tier1": "Rider Tier1",
  "VS-chat-spa-ES-tier1": "Vendor Chat",
};

export const TIER1_COMBINED_KEY = "Customer Tier1";

export function getMaxConcurrency(
  team: string,
  agents: number
): number {
  if (team === "Rider Tier1") {
    if (agents < 15) return 1;
    if (agents < 40) return 1.5;
    if (agents < 80) return 1.9;
    return 3;
  }

  if (agents < 10) return 1;
  if (agents < 30) return 1.2;
  if (agents < 80) return 1.3;
  return 1.5;
}

type TableRow = {
  team: string;
  backlog: number;
  tickets: number;
  agents: number;
};

export function buildTableText(rows: TableRow[]): string {
  const header = `Team\tBacklog\tTickets\tAgents`;

  const body = rows.map(r =>
    `${r.team}\t${r.backlog}\t${r.tickets}\t${r.agents}`
  );

  const time = getPeruRoundedTime();

  return [
    header,
    ...body,
    "",
    `Conexión: ${time} HP`,
  ].join("\n");
}