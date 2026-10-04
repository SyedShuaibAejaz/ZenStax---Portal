"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DeleteQuotationButtonProps = {
  quotationId: string;
  quotationNumber?: string;
};

export function DeleteQuotationButton({
  quotationId,
  quotationNumber,
}: DeleteQuotationButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const documentName = quotationNumber
      ? ` ${quotationNumber}`
      : "";

    const confirmed = window.confirm(
      `Delete quotation${documentName}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/quotations/${quotationId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not delete quotation.",
        );
      }

      router.push("/quotations");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete quotation.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={isDeleting}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {isDeleting ? "Deleting..." : "Delete quotation"}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}