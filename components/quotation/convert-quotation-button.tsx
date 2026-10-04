"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ConvertQuotationButtonProps = {
  quotationId: string;
  quotationStatus: string;
};

export function ConvertQuotationButton({
  quotationId,
  quotationStatus,
}: ConvertQuotationButtonProps) {
  const router = useRouter();

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAccepted = quotationStatus === "accepted";
  const isConverted = quotationStatus === "converted";

  async function handleConvert() {
    const confirmed = window.confirm(
      "Convert this accepted quotation into an invoice?",
    );

    if (!confirmed) {
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/quotations/${quotationId}/convert`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not convert quotation.",
        );
      }

      router.push(`/invoices/${result.invoiceId}`);
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not convert quotation.",
      );
      setIsConverting(false);
    }
  }

  if (isConverted) {
    return (
      <p className="text-sm font-medium text-green-700">
        Converted to invoice
      </p>
    );
  }

  return (
    <div>
      <Button
        type="button"
        disabled={!isAccepted || isConverting}
        onClick={handleConvert}
        className="bg-zen-orange text-white hover:bg-orange-600"
      >
        {isConverting
          ? "Converting..."
          : "Convert to invoice"}
      </Button>

      {!isAccepted && (
        <p className="mt-2 text-xs text-muted-foreground">
          Mark the quotation as accepted first.
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}