"use client";

import html2canvas from "html2canvas-pro";

interface CopyImageButtonProps {
  targetId: string;        // ID del elemento a capturar
  label?: string;          // Texto del botón
  scale?: number;          // Calidad de imagen
}

export const CopyImageButton: React.FC<CopyImageButtonProps> = ({
  targetId,
  label = "Copiar imagen",
  scale = 2,
}) => {
  const handleCopy = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      alert("Elemento no encontrado");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor: "#ffffff", // evita fondo transparente
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return alert("Error generando la imagen");

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      }, "image/png");
    } catch (error) {
      console.error("Error copiando imagen:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="border px-3 py-1 rounded text-sm hover:bg-gray-100"
    >
      {label}
    </button>
  );
};
