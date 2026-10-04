import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CreditNoteForm,
  type CreditableLine,
} from "@/components/credit-note/credit-note-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewCreditNotePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
        id,
        invoice_number,
        status,
        currency,
        subtotal,
        discount,
        total,
        credited_amount,
        clients (
          name,
          company_name
        ),
        invoice_items (
          id,
          description,
          quantity,
          unit_price,
          vat_rate,
          credit_note_items (
            quantity
          )
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const client = Array.isArray(invoice.clients)
    ? invoice.clients[0]
    : invoice.clients;

  const lines: CreditableLine[] = (invoice.invoice_items ?? []).map((item) => {
    const alreadyCredited = (item.credit_note_items ?? []).reduce(
      (sum, credit) => sum + Number(credit.quantity ?? 0),
      0,
    );
    const invoicedQty = Number(item.quantity ?? 0);

    return {
      id: item.id,
      description: item.description,
      unitPrice: Number(item.unit_price ?? 0),
      vatRate: Number(item.vat_rate ?? 0),
      invoicedQty,
      remainingQty: Math.max(Math.round((invoicedQty - alreadyCredited) * 10000) / 10000, 0),
    };
  });

  const blocked =
    invoice.status === "draft"
      ? "Draft invoices can be edited or deleted; a credit note is not needed."
      : invoice.status === "cancelled"
        ? "This invoice is already cancelled."
        : lines.every((line) => line.remainingQty <= 0)
          ? "Everything on this invoice has already been credited."
          : null;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">New tax credit note</p>
          <h2 className="text-2xl font-semibold">
            Credit against {invoice.invoice_number}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {client?.company_name || client?.name || "Unknown client"} · Invoice
            total {invoice.currency} {Number(invoice.total).toFixed(2)} · Already
            credited {invoice.currency}{" "}
            {Number(invoice.credited_amount ?? 0).toFixed(2)}
          </p>
        </div>

        <Link
          href={`/invoices/${invoice.id}`}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Back to invoice
        </Link>
      </div>

      {blocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {blocked}
        </div>
      ) : (
        <CreditNoteForm
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          currency={invoice.currency}
          invoiceSubtotal={Number(invoice.subtotal ?? 0)}
          invoiceDiscount={Number(invoice.discount ?? 0)}
          lines={lines}
        />
      )}
    </section>
  );
}
