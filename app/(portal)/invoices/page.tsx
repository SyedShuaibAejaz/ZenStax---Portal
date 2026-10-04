import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

function formatCurrency(
  amount: number | string | null,
  currency: string,
) {
  return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
}

function formatStatus(status: string) {
  return status.replace("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";

    case "partially_paid":
      return "bg-amber-100 text-amber-700";

    case "overdue":
      return "bg-red-100 text-red-700";

    case "cancelled":
      return "bg-slate-200 text-slate-600";

    default:
      return "bg-blue-100 text-blue-700";
  }
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

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Issue date</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
            </tr>
          </thead>

          <tbody>
            {invoices?.map((invoice) => {
              const client = Array.isArray(invoice.clients)
                ? invoice.clients[0]
                : invoice.clients;

              return (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-100 last:border-0"
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
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClasses(
                        invoice.status,
                      )}`}
                    >
                      {formatStatus(invoice.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(
                      invoice.total,
                      invoice.currency,
                    )}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatCurrency(
                      invoice.amount_paid,
                      invoice.currency,
                    )}
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