import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CreditNotesPage() {
  const supabase = await createClient();

  const { data: creditNotes, error } = await supabase
    .from("credit_notes")
    .select(
      `
        id,
        credit_note_number,
        issue_date,
        reason,
        currency,
        total,
        invoices (
          id,
          invoice_number
        ),
        clients (
          name,
          company_name
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Could not load credit notes</h2>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Financial records</p>
        <h2 className="text-2xl font-semibold">Credit notes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue a credit note from an invoice to reverse all or part of it.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50">
            <tr>
              <th className="px-4 py-3">Credit note</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {creditNotes?.map((note) => {
              const client = Array.isArray(note.clients) ? note.clients[0] : note.clients;
              const invoice = Array.isArray(note.invoices) ? note.invoices[0] : note.invoices;

              return (
                <tr key={note.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-4 font-medium">
                    <Link
                      href={`/credit-notes/${note.id}`}
                      className="text-zen-orange hover:underline"
                    >
                      {note.credit_note_number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {invoice ? (
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {client?.company_name || client?.name || "—"}
                  </td>
                  <td className="px-4 py-4">{note.issue_date}</td>
                  <td className="max-w-xs truncate px-4 py-4">{note.reason}</td>
                  <td className="px-4 py-4 text-right">
                    {note.currency} {Number(note.total).toFixed(2)}
                  </td>
                </tr>
              );
            })}

            {!creditNotes?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No credit notes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
