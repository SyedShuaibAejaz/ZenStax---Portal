"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

type QuotationStatusActionsProps = {
  quotationId: string;
  currentStatus: QuotationStatus;
};

export function QuotationStatusActions({
  quotationId,
  currentStatus,
}: QuotationStatusActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: QuotationStatus) {
    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("quotations")
      .update({ status })
      .eq("id", quotationId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.refresh();
    setIsSaving(false);
  }

  const actions = [
    { label: "Mark as sent", status: "sent" as const },
    {
      label: "Mark as accepted",
      status: "accepted" as const,
    },
    {
      label: "Mark as rejected",
      status: "rejected" as const,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions
          .filter(({ status }) => status !== currentStatus)
          .map(({ label, status }) => (
            <Button
              key={status}
              type="button"
              variant="outline"
              disabled={isSaving || currentStatus === "converted"}
              onClick={() => updateStatus(status)}
            >
              {label}
            </Button>
          ))}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}