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
import { useConfirmAction } from "./useConfirmAction";

interface ConfirmActionDialogProps {
  backendUrl: string;
  endpoint: string;
  buttonText: string;
  buttonVariant?: "default" | "destructive";
  dialogTitle: string;
  dialogDescription: string;
  confirmText: string;
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription?: string;
  onSuccess?: () => void;
}

export function ConfirmActionDialog({
  backendUrl,
  endpoint,
  buttonText,
  buttonVariant = "default",
  dialogTitle,
  dialogDescription,
  confirmText,
  successTitle,
  successDescription,
  errorTitle,
  errorDescription,
  onSuccess,
}: ConfirmActionDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, loading } = useConfirmAction({
    backendUrl,
    endpoint,
    successTitle,
    successDescription,
    errorTitle,
    errorDescription,
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={() => setOpen(true)}
      >
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              variant={buttonVariant}
              onClick={execute}
              disabled={loading}
            >
              {loading ? "Processing..." : confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
