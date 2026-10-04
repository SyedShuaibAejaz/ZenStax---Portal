"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type DownloadQuotationButtonProps = {
  quotationId: string;
};

export function DownloadQuotationButton({
  quotationId,
}: DownloadQuotationButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const response = await fetch(
        `/api/quotations/${quotationId}/pdf`,
      );

      if (!response.ok) {
        throw new Error("Could not generate PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "zenstax-quotation.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert("Could not download the quotation PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-zen-orange text-white hover:bg-orange-600"
    >
      {isDownloading ? "Generating..." : "Download PDF"}
    </Button>
  );
}