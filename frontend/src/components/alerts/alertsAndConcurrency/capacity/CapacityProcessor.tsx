"use client";
import { useState, useMemo } from "react";
import { parseQueues, countDedicatedAgents, calculateCustomerTier1Agents } from "./parser";
import { buildCapacityText, buildAvailabilityLine } from "./calculeConcurrency";
import { calculateAvailableAgents } from "./calculeConcurrency";
import { ChartWrapper } from "@/components/utils/ChartCopyButton";
import { buildTableText } from "./utils";
import html2canvas from "html2canvas-pro";

export const CapacityProcessor = () => {
  const [queuesInput, setQueuesInput] = useState("");
  const [agentsInput, setAgentsInput] = useState("");

  const queues = useMemo(() => parseQueues(queuesInput), [queuesInput]);
  const dedicated = useMemo(
    () => countDedicatedAgents(agentsInput),
    [agentsInput]
  );

  const customerLive = queues.find(q => q.team === "Customer Live");
  const customerNonLive = queues.find(q => q.team === "Customer Non Live");

  const riderTier1 = queues.find(q => q.team === "Rider Tier1");
  const vendorTier1 = queues.find(q => q.team === "Vendor Chat");

  const cleanInputs = () => {
    setQueuesInput("")
    setAgentsInput("")
  }

  const tier1Results = useMemo(() => {
    const results = [];

    // ✅ Customer Tier1 (Live + Non Live)
    if (customerLive && customerNonLive) {
      results.push({
        key: "customer",
        label: "Customer Tier1",
        agents: calculateCustomerTier1Agents(
          customerLive.agents,
          customerNonLive.agents,
          dedicated.live,
          dedicated.nonLive
        ),
        tickets: customerLive.tickets + customerNonLive.tickets,
        backlog: customerLive.backlog + customerNonLive.backlog,
      });
    }

    // ✅ Rider Tier1 (simple)
    if (riderTier1) {
      results.push({
        key: "rider",
        label: "Rider Tier1",
        agents: riderTier1.agents,
        tickets: riderTier1.tickets,
        backlog: riderTier1.backlog,
      });
    }

    // ✅ Vendor Chat (simple)
    if (vendorTier1) {
      results.push({
        key: "vendor",
        label: "Vendor Chat",
        agents: vendorTier1.agents,
        tickets: vendorTier1.tickets,
        backlog: vendorTier1.backlog,
      });
    }

    return results;
  }, [
    customerLive,
    customerNonLive,
    riderTier1,
    vendorTier1,
    dedicated,
  ]);

  const tableRows = useMemo(() => {
    const tier1Rows = tier1Results.map(r => ({
      team: r.label.toUpperCase(),
      backlog: r.backlog,
      tickets: r.tickets,
      agents: r.agents,
    }));

    const tier2Rows = queues
      .filter(q => q.team.includes("Tier2"))
      .map(q => ({
        team: q.team.toUpperCase(),
        backlog: q.backlog,
        tickets: q.tickets,
        agents: q.agents,
      }));

    return [...tier1Rows, ...tier2Rows];
  }, [tier1Results, queues]);

  const availabilityText = useMemo(() => {
    const lines = tier1Results.map(r => {
      const concurrency = parseFloat(
        (r.tickets / Math.max(r.agents, 1)).toFixed(2)
      );

      const available = calculateAvailableAgents(
        r.label,
        r.agents,
        r.tickets
      );

      return `➡️ ${r.label} - Concurrencia: ${concurrency}. ${
        available > 0
          ? `Se tiene disponibilidad para sacar ${available} agentes para refuerzos.`
          : `Sin agentes disponibles para refuerzos en el canal`
      }`;
    });

    return (
      lines.join("\n") +
      `\n\n🚨Tener en cuenta que se debe avanzar por equipo de Supervisión y compartir la lista de los As para el control interno`
    );
  }, [tier1Results]);

  const handleCopy = async () => {
    const element = document.getElementById("table-concurrency-ref");
    if (!element) return alert("Elemento no encontrado");

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return alert("Error generando la imagen");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      }, "image/png");
    } catch (error) {
      console.error("Error copiando el chart:", error);
    }
  };


  return (
    <div className="w-[60%] mx-auto space-y-4 p-4">
      <textarea
        className="w-full border p-2"
        rows={6}
        placeholder="Pega colas"
        value={queuesInput}
        onChange={e => setQueuesInput(e.target.value)}
      />

      <textarea
        className="w-full border p-2"
        rows={6}
        placeholder="Pega agentes"
        value={agentsInput}
        onChange={e => setAgentsInput(e.target.value)}
      />
      <button
            className="border px-4 py-2 text-xs font-bold"
            onClick={cleanInputs}
          >
          Limpiar
      </button>
      <section>
        <table id="table-concurrency-ref" className="mx-auto w-[70%] text-xs border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-1">TEAM</th>
              <th className="border p-1">BACKLOG</th>
              <th className="border p-1">TICKETS</th>
              <th className="border p-1">AGENTS</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(r => (
              <tr key={r.team}>
                <td className="border p-1">{r.team}</td>
                <td className="border p-1">{r.backlog}</td>
                <td className="border p-1">{r.tickets}</td>
                <td className="border p-1">{r.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-3 mx-auto w-[70%]">
          <button className="border px-4 py-2 text-xs font-bold" onClick={handleCopy}> Copiar Imagen</button>
          <button
            className="border px-4 py-2 text-xs font-bold"
            onClick={() =>
              navigator.clipboard.writeText(buildTableText(tableRows))
            }
          >
            Copiar Texto
          </button>
        </div>
      </section>

      <div className="mx-auto w-[70%] space-y-2">
        <div className="flex gap-2 flex-wrap">
          {tier1Results.map(r => (
            <button
              key={r.key}
              className="border px-3 py-1 text-xs"
              onClick={() =>
                navigator.clipboard.writeText(
                  buildCapacityText(r.label, r.agents, r.tickets, r.backlog)
                )
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className="border px-4 py-2 text-xs font-bold"
            onClick={() => navigator.clipboard.writeText(availabilityText)}
          >
            Disponibilidad
          </button>
        </div>
      </div>

    </div>
  );
};
