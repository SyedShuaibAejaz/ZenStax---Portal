"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

type InvoiceStatusActionsProps = {
  invoiceId: string;
  currentStatus: InvoiceStatus;
  currentAmountPaid: number;
  total: number;
};

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
  currentAmountPaid,
  total,
}: InvoiceStatusActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [amountPaid, setAmountPaid] = useState(
    String(currentAmountPaid),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function determineStatus(
    paidAmount: number,
  ): InvoiceStatus {
    if (paidAmount <= 0) {
      return "sent";
    }

    if (paidAmount >= total) {
      return "paid";
    }

    return "partially_paid";
  }

  async function savePayment() {
    const paidAmount = Number(amountPaid);

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (paidAmount > total) {
      setError("Paid amount cannot exceed the invoice total.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const nextStatus = determineStatus(paidAmount);

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        amount_paid: paidAmount,
        status: nextStatus,
      })
      .eq("id", invoiceId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.refresh();
    setIsSaving(false);
  }

  async function markAsSent() {
    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.refresh();
    setIsSaving(false);
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/45 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            Payment status
          </p>

          <p className="text-sm capitalize text-muted-foreground">
            Current status: {currentStatus.replace("_", " ")}
          </p>
        </div>

        {currentStatus === "draft" && (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={markAsSent}
          >
            Mark as sent
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium">
            Amount paid
          </span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amountPaid}
            onChange={(event) =>
              setAmountPaid(event.target.value)
            }
            disabled={isSaving}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          />
        </label>

        <Button
          type="button"
          disabled={isSaving}
          onClick={savePayment}
        >
          {isSaving ? "Saving..." : "Update payment"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}