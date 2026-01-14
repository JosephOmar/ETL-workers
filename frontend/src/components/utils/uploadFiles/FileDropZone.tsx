"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileDropzone({ label, file, onFileChange }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium">{label}</span>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition",
          file
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-blue-500"
        )}
      >
        {file ? (
          <p className="text-sm text-green-700">📄 {file.name}</p>
        ) : (
          <p className="text-sm text-gray-500">
            Drag a file here or click
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
