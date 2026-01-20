import { QUEUE_NAME_MAP } from "./utils";

export interface QueueRow {
  team: string;
  backlog: number;
  tickets: number;
  agents: number;
}

export function parseQueues(input: string): QueueRow[] {
  return input
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\t+/);

      const rawName = parts[0];
      const mappedName = QUEUE_NAME_MAP[rawName];
      if (!mappedName) return null;

      return {
        team: mappedName,
        backlog: Number(parts[1] ?? 0),
        tickets: Number(parts[2] ?? 0),
        agents: Number(parts[3] ?? 0),
      };
    })
    .filter(Boolean) as QueueRow[];
}


export function countDedicatedAgents(input: string) {
  const live = (input.match(/WHL-Cxx-live-order-ChatOnly/g) || []).length;
  const nonLive = (input.match(/WHL-Cxx-nonlive-order-ChatOnly/g) || []).length;

  return { live, nonLive };
}

export function calculateCustomerTier1Agents(
  liveAgents: number,
  nonLiveAgents: number,
  dedicatedLive: number,
  dedicatedNonLive: number
) {
  const total = liveAgents + nonLiveAgents;

  const shared = Math.ceil(
    (total - dedicatedLive - dedicatedNonLive) / 2
  );

  return shared + dedicatedLive + dedicatedNonLive;
}
