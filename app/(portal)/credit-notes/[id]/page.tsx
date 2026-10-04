import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function money(amount: number | string | null, currency: string) {
  return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
}

export default async function CreditNoteDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("credit_notes")
    .select(
      `
        id,
        credit_note_number,
        issue_date,
        reason,
        currency,
        subtotal,
        discount,
        vat_amount,
        total,
        invoices (
          id,
          invoice_number
        ),
        clients (
          name,
          company_name,
          email,
          trn
        ),
        credit_note_items (
          id,
          description,
          quantity,
          unit_price,
          vat_rate,
          line_total
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !note) {
    notFound();
  }

  const client = Array.isArray(note.clients) ? note.clients[0] : note.clients;
  const invoice = Array.isArray(note.invoices) ? note.invoices[0] : note.invoices;

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Tax credit note</p>
          <h2 className="text-2xl font-semibold">{note.credit_note_number}</h2>
          {invoice && (
            <p className="mt-1 text-sm text-muted-foreground">
              Against{" "}
              <Link href={`/invoices/${invoice.id}`} className="text-zen-orange hover:underline">
                {invoice.invoice_number}
              </Link>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/credit-notes"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to credit notes
          </Link>

          <a
            href={`/api/credit-notes/${note.id}/pdf`}
            className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Download PDF
          </a>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Credited to</p>
            <h3 className="mt-1 text-lg font-semibold">
              {client?.company_name || client?.name || "Unknown client"}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {client?.company_name && <p>Contact: {client.name}</p>}
              {client?.email && <p>{client.email}</p>}
              {client?.trn && <p>TRN: {client.trn}</p>}
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="mt-1 font-medium">{note.issue_date}</p>
            <p className="mt-4 text-sm text-muted-foreground">Reason</p>
            <p className="mt-1 whitespace-pre-wrap">{note.reason}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-slate-50">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit price</th>
                <th className="px-4 py-3 text-right">VAT</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {note.credit_note_items?.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{Number(item.quantity)}</td>
                  <td className="px-4 py-3 text-right">{money(item.unit_price, note.currency)}</td>
                  <td className="px-4 py-3 text-right">{Number(item.vat_rate)}%</td>
                  <td className="px-4 py-3 text-right">{money(item.line_total, note.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{money(note.subtotal, note.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd>{money(note.discount, note.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">VAT</dt>
            <dd>{money(note.vat_amount, note.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
            <dt>Total credited</dt>
            <dd className="text-zen-orange">{money(note.total, note.currency)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
