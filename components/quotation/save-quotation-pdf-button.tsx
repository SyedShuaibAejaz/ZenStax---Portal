"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type SaveQuotationPdfButtonProps = {
  quotationId: string;
};

type SavePdfResponse = {
  success?: boolean;
  path?: string;
  error?: string;
};

export function SaveQuotationPdfButton({
  quotationId,
}: SaveQuotationPdfButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/quotations/${quotationId}/pdf/save`,
        { method: "POST" },
      );

      // A Next.js 404/405 response may have an empty or non-JSON body.
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