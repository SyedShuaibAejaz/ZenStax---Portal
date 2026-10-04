"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DeleteInvoiceButtonProps = {
  invoiceId: string;
  invoiceNumber?: string;
};

export function DeleteInvoiceButton({
  invoiceId,
  invoiceNumber,
}: DeleteInvoiceButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const documentLabel = invoiceNumber
      ? ` ${invoiceNumber}`
      : "";

    const confirmed = window.confirm(
      `Delete invoice${documentLabel}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/invoices/${invoiceId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not delete invoice.",
        );
      }

      router.push("/invoices");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete invoice.",
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
        {isDeleting ? "Deleting..." : "Delete invoice"}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}