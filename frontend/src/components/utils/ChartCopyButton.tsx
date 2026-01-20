// components/ChartWrapper.tsx
"use client";

import React from "react";
import type { ReactNode } from "react";
import html2canvas from "html2canvas-pro";
import { Button } from "@components/ui/button";

interface Props {
  id: string;               // ID único del contenedor
  title: string;            // Título del chart
  children: ReactNode;      // Chart
}

export const ChartWrapper: React.FC<Props> = ({ id, title, children }) => {
  const handleCopy = async () => {
    const element = document.getElementById(id);
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
    <section>
      <div id={id} className="p-4 bg-white rounded shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {children}
      </div>
      <Button onClick={handleCopy} size="sm" variant="outline">
        Copy Image
      </Button>
    </section>
  );
};
