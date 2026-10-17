import Link from "next/link";

import {
  effectiveInvoiceStatus,
  formatStatus,
  invoiceBalance,
  invoiceStatusClasses,
  todayInDubai,
} from "@/lib/invoice-status";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function formatCurrency(
  amount: number | string | null,
  currency: string,
) {
  return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
}

export default async function InvoicesPage() {
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      `
        id,
        invoice_number,
        issue_date,
        due_date,
        status,
        currency,
        total,
        amount_paid,
        credited_amount,
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
        <h2 className="font-semibold text-red-800">
          Could not load invoices
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error.message}
        </p>
      </section>
    );
  }

  const today = todayInDubai();

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Financial records
          </p>

          <h2 className="text-2xl font-semibold">Invoices</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track invoices and payment status.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          New invoice
        </Link>
      </div>

      <div className="responsive-table overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-border bg-muted/45">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Issue date</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Balance due</th>
            </tr>
          </thead>

          <tbody>
            {invoices?.map((invoice) => {
              const status = effectiveInvoiceStatus(invoice, today);
              const balance =
                invoice.status === "draft" || invoice.status === "cancelled"
                  ? 0
                  : invoiceBalance(invoice);

              const client = Array.isArray(invoice.clients)
                ? invoice.clients[0]
                : invoice.clients;

              return (
                <tr
                  key={invoice.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-4 font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-zen-orange hover:underline"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    {client?.company_name ||
                      client?.name ||
                      "—"}
                  </td>

                  <td className="px-4 py-4">
                    {invoice.issue_date}
                  </td>

                  <td className="px-4 py-4">
                    {invoice.due_date || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${invoiceStatusClasses(
                        status,
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-medium tabular-nums">
                    {formatCurrency(
                      invoice.total,
                      invoice.currency,
                    )}
                  </td>

                  <td
                    className={`px-4 py-4 text-right tabular-nums ${
                      status === "overdue"
                        ? "font-semibold text-red-600"
                        : balance > 0
                          ? "font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {balance > 0
                      ? formatCurrency(balance, invoice.currency)
                      : "—"}
                  </td>
                </tr>
              );
            })}

            {!invoices?.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No invoices created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}