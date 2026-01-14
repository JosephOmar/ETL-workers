"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseConfirmActionProps {
  backendUrl: string;
  endpoint: string;
  method?: "POST" | "DELETE" | "PUT";
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription?: string;
  onSuccess?: () => void;
}

export function useConfirmAction({
  backendUrl,
  endpoint,
  method = "POST",
  successTitle,
  successDescription,
  errorTitle,
  errorDescription,
  onSuccess,
}: UseConfirmActionProps) {
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${backendUrl}${endpoint}`, { method });

      if (!res.ok) throw new Error("Request failed");

      toast(successTitle, { description: successDescription });
      onSuccess?.();
      return true;
    } catch (err: any) {
      toast.error(errorTitle, {
        description: err?.message ?? errorDescription,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}
