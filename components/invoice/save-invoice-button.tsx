"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type SaveInvoicePdfButtonProps = {
  invoiceId: string;
};

type SavePdfResponse = {
  success?: boolean;
  path?: string;
  error?: string;
};

export function SaveInvoicePdfButton({
  invoiceId,
}: SaveInvoicePdfButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/invoices/${invoiceId}/pdf/save`,
        { method: "POST" },
      );

      const contentType = response.headers.get("content-type") ?? "";
      let result: SavePdfResponse = {};

      if (contentType.includes("application/json")) {
        result = (await response.json()) as SavePdfResponse;
      }

      if (!response.ok) {
        throw new Error(
          result.error ??
            `Could not save the PDF (HTTP ${response.status}).`,
        );
      }

      if (result.success !== true) {
        throw new Error(
          "The server did not confirm that the PDF was saved.",
        );
      }

      setMessage("PDF saved to the portal.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save the PDF.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={isSaving}
        onClick={handleSave}
      >
        {isSaving ? "Saving..." : "Save PDF to portal"}
      </Button>

      {message && (
        <p className="mt-2 text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}