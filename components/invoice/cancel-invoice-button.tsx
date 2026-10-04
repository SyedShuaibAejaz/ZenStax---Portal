"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type CancelInvoiceButtonProps = {
  invoiceId: string;
  invoiceNumber: string;
};

export function CancelInvoiceButton({
  invoiceId,
  invoiceNumber,
}: CancelInvoiceButtonProps) {
  const router = useRouter();

  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const reason = window.prompt(
      `Cancel invoice ${invoiceNumber}?\n\nA credit note for the full amount will be issued and the invoice marked cancelled. Both keep their numbers on record. This cannot be undone.\n\nReason for cancelling:`,
    );

    if (reason === null) {
      return;
    }

    if (reason.trim().length < 3) {
      setError("Enter a reason for cancelling this invoice.");
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not cancel invoice.");
      }

      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not cancel invoice.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        disabled={isCancelling}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {isCancelling ? "Cancelling..." : "Cancel invoice"}
      </Button>

      {error && <p className="max-w-xs text-sm text-red-600">{error}</p>}
    </div>
  );
}
