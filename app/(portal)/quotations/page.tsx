import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

function formatCurrency(
  amount: number | string | null,
  currency: string,
) {
  return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
}

function statusClasses(status: string) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "converted":
      return "bg-purple-100 text-purple-700";

    case "sent":
      return "bg-blue-100 text-blue-700";

    case "expired":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-orange-100 text-orange-700";
  }
}

export default async function QuotationsPage() {
  const supabase = await createClient();

  const { data: quotations, error } = await supabase
    .from("quotations")
    .select(
      `
        id,
        quotation_number,
        issue_date,
        valid_until,
        status,
        currency,
        total,
        created_at,
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
          Could not load quotations
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
            Sales documents
          </p>

          <h2 className="text-2xl font-semibold">
            Quotations
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Prepare and manage client quotations.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          New quotation
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50">
            <tr>
              <th className="px-4 py-3">Quotation</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Issue date</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {quotations?.map((quotation) => {
              const client = Array.isArray(quotation.clients)
                ? quotation.clients[0]
                : quotation.clients;

              return (
                <tr
                  key={quotation.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-4 font-medium">
                    <Link
                      href={`/quotations/${quotation.id}`}
                      className="text-zen-orange hover:underline"
                    >
                      {quotation.quotation_number}
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    {client?.company_name ||
                      client?.name ||
                      "—"}
                  </td>

                  <td className="px-4 py-4">
                    {quotation.issue_date}
                  </td>

                  <td className="px-4 py-4">
                    {quotation.valid_until || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClasses(
                        quotation.status,
                      )}`}
                    >
                      {quotation.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(
                      quotation.total,
                      quotation.currency,
                    )}
                  </td>
                </tr>
              );
            })}

            {!quotations?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No quotations created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}