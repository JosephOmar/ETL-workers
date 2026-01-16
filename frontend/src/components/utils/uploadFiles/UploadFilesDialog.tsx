"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { FileDropzone } from "./FileDropZone";
import { useUploadFiles, type UploadField } from "./useUploadFiles";

interface UploadFilesDialogProps {
  backendUrl: string;
  endpoint: string;
  title: string;
  description: string;
  buttonText: string;
  submitText?: string;
  fields: UploadField[];
  withTargetDate?: boolean;
  onAfterUpload?: () => void;
}

export function UploadFilesDialog({
  backendUrl,
  endpoint,
  title,
  description,
  buttonText,
  submitText = "Subir archivos",
  fields,
  withTargetDate,
  onAfterUpload,
}: UploadFilesDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const { files, setFile, upload, loading } = useUploadFiles({
    backendUrl,
    endpoint,
    fields,
    targetDate: withTargetDate ? targetDate ?? undefined : undefined,
    onAfterUpload,
  });

  const handleSubmit = async () => {
    if (withTargetDate && !targetDate) {
      toast.error("Date required", {
        description: "You must select a date before uploading attendance",
      });
      return;
    }

    const success = await upload();
    if (success) setOpen(false);
  };

  return (
    <>
      <Button className="bg-blue-500 hover:bg-blue-700" onClick={() => setOpen(true)}>
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <FileDropzone
                key={field.key}
                label={field.label}
                file={files[field.key]}
                onFileChange={(file) => setFile(field.key, file)}
              />
            ))}
          </div>
          {withTargetDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <input
                type="date"
                value={targetDate ?? ""}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Procesando..." : submitText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
