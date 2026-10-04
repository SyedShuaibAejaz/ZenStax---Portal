"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CreditableLine = {
  id: string;
  description: string;
  unitPrice: number;
  vatRate: number;
  invoicedQty: number;
  remainingQty: number;
};

type CreditNoteFormProps = {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  invoiceSubtotal: number;
  invoiceDiscount: number;
  lines: CreditableLine[];
};

const round = (value: number) => Math.round(value * 100) / 100;

export function CreditNoteForm({
  invoiceId,
  invoiceNumber,
  currency,
  invoiceSubtotal,
  invoiceDiscount,
  lines,
}: CreditNoteFormProps) {
  const router = useRouter();

  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((line) => [line.id, "0"])),
  );
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Same maths as the database (estimate; the database is the source of truth)
  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let vat = 0;

    for (const line of lines) {
      const qty = Number(quantities[line.id] ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const base = round(qty * line.unitPrice);
      const lineDiscount =
        invoiceSubtotal > 0 ? round((invoiceDiscount * base) / invoiceSubtotal) : 0;

      subtotal += base;
      discount += lineDiscount;
      vat += round(((base - lineDiscount) * line.vatRate) / 100);
    }

    return {
      subtotal: round(subtotal),
      discount: round(discount),
      vat: round(vat),
      total: round(subtotal - discount + vat),
    };
  }, [lines, quantities, invoiceSubtotal, invoiceDiscount]);

  function creditEverything() {
    setQuantities(
      Object.fromEntries(lines.map((line) => [line.id, String(line.remainingQty)])),
    );
  }

  async function submit() {
    setError(null);

    if (reason.trim().length < 3) {
      setError("Enter a reason for the credit note.");
      return;
    }

    const items = lines
      .map((line) => ({
        invoice_item_id: line.id,
        quantity: Number(quantities[line.id] ?? 0),
        line,
      }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      setError("Enter a quantity for at least one line.");
      return;
    }

    const tooMuch = items.find((item) => item.quantity > item.line.remainingQty);
    if (tooMuch) {
      setError(
        `"${tooMuch.line.description}" can be credited for at most ${tooMuch.line.remainingQty}.`,
      );
      return;
    }

    if (
      !window.confirm(
        `Issue a credit note of ${currency} ${totals.total.toFixed(2)} against ${invoiceNumber}? Credit notes cannot be edited or deleted.`,
      )
    ) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/credit-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          items: items.map(({ invoice_item_id, quantity }) => ({
            invoice_item_id,
            quantity,
          })),
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        creditNoteId?: string;
      };

      if (!response.ok || !result.creditNoteId) {
        throw new Error(result.error ?? "Could not issue credit note.");
      }

      router.push(`/credit-notes/${result.creditNoteId}`);
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not issue credit note.",
      );
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold">Lines to credit</h3>
        <Button type="button" variant="outline" onClick={creditEverything}>
          Credit everything remaining
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Unit price</th>
              <th className="px-4 py-3 text-right">Invoiced</th>
              <th className="px-4 py-3 text-right">Can credit</th>
              <th className="px-4 py-3 text-right">Credit qty</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3 text-right">
                  {currency} {line.unitPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">{line.invoicedQty}</td>
                <td className="px-4 py-3 text-right">{line.remainingQty}</td>
                <td className="px-4 py-3 text-right">
                  <Input
                    type="number"
                    min={0}
                    max={line.remainingQty}
                    step="any"
                    disabled={line.remainingQty <= 0}
                    value={quantities[line.id] ?? "0"}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [line.id]: event.target.value,
                      }))
                    }
                    className="ml-auto w-24 text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Service not delivered, pricing error, client returned items"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Printed on the credit note.
          </p>
        </div>

        <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{currency} {totals.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount share</dt>
            <dd>{currency} {totals.discount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">VAT</dt>
            <dd>{currency} {totals.vat.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Credit total</dt>
            <dd className="text-zen-orange">{currency} {totals.total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={submit}
          disabled={isSaving}
          className="bg-zen-orange text-white hover:bg-orange-600"
        >
          {isSaving ? "Issuing..." : "Issue credit note"}
        </Button>
      </div>
    </div>
  );
}
