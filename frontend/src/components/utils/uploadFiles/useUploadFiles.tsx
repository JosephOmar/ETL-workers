"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface UploadField {
  key: string;
  label: string;
}

export interface UseUploadFilesProps {
  backendUrl: string;
  endpoint: string;
  fields: UploadField[];
  targetDate?: string;
  onAfterUpload?: () => void;
}

export function useUploadFiles({
  backendUrl,
  endpoint,
  fields,
  targetDate,
  onAfterUpload,
}: UseUploadFilesProps) {
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<Record<string, File | null>>(
    Object.fromEntries(fields.map((f) => [f.key, null]))
  );

  const setFile = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const resetFiles = () => {
    setFiles(Object.fromEntries(fields.map((f) => [f.key, null])));
  };

  const upload = async () => {
    const missing = fields.some((f) => !files[f.key]);
    if (missing) {
      toast.error("Files are missing", {
        description: `You must upload the ${fields.length} required files`,
      });
      return false;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      fields.forEach((f) => {
        if (files[f.key]) {
          formData.append("files", files[f.key]!);
        }
      });

      if (targetDate) {
        formData.append("target_date", targetDate);
      }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error uploading files");

      const result = await res.json();

      toast("Upload complete", {
        description: result?.message ?? "Files processed successfully",
      });

      resetFiles();
      onAfterUpload?.();
      return true;
    } catch (err: any) {
      toast.error("Error during upload", {
        description: err?.message ?? "Files could not be uploaded",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    setFile,
    upload,
    loading,
  };
}
