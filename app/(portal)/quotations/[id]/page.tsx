import Link from "next/link";
import { notFound } from "next/navigation";

import { ConvertQuotationButton } from "@/components/quotation/convert-quotation-button";
import { DownloadQuotationButton } from "@/components/quotation/download-button";
import { SaveQuotationPdfButton } from "@/components/quotation/save-quotation-pdf-button";
import { QuotationStatusActions } from "@/components/quotation/quotation-status-bar";
import { createClient } from "@/lib/supabase/server";
import { DeleteQuotationButton } from "@/components/quotation/quotation-delete-button";
import type { CustomColumn } from "@/components/quotation/quotation-form";

export const instant = false;

type QuotationDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(
  amount: number | string | null,
  currency: string,
) {
  return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function parseCustomColumns(value: unknown): CustomColumn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (column): column is CustomColumn =>
      typeof column === "object" &&
      column !== null &&
      typeof (column as CustomColumn).key === "string" &&
      typeof (column as CustomColumn).label === "string",
  );
}

function getCustomValue(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "—";
  }

  const cell = (value as Record<string, unknown>)[key];

  return cell === undefined || cell === null || String(cell).trim() === ""
    ? "—"
    : String(cell);
}

export default async function QuotationDetailsPage({
  params,
}: QuotationDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quotation, error } = await supabase
    .from("quotations")
    .select(
      `
        id,
        quotation_number,
        issue_date,
        valid_until,
        status,
        currency,
        subtotal,
        discount,
        vat_amount,
        total,
        notes,
        pdf_path,
        custom_columns,
        created_at,
        clients (
          id,
          name,
          company_name,
          email,
          phone,
          address,
          trn
        ),
        quotation_items (
          id,
          description,
          quantity,
          unit_price,
          vat_rate,
          line_total,
          custom_values
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !quotation) {
    notFound();
  }

  const client = Array.isArray(quotation.clients)
    ? quotation.clients[0]
    : quotation.clients;

  const customColumns = parseCustomColumns(quotation.custom_columns);

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Sales document
          </p>

          <h2 className="text-2xl font-semibold">
            {quotation.quotation_number}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Created on{" "}
            {formatDate(quotation.created_at.slice(0, 10))}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/quotations"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to quotations
          </Link>

          <Link
            href={`/quotations/${quotation.id}/edit`}
            className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Edit quotation
          </Link>

          <DownloadQuotationButton quotationId={quotation.id} />

          {quotation.pdf_path && (
            <a
              href={`/api/quotations/${quotation.id}/pdf/saved`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              View saved PDF
            </a>
          )}

          <SaveQuotationPdfButton quotationId={quotation.id} />

          <ConvertQuotationButton
            quotationId={quotation.id}
            quotationStatus={quotation.status}
          />

          <DeleteQuotationButton
            quotationId={quotation.id}
            quotationNumber={quotation.quotation_number}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prepared for
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {client?.company_name ||
                client?.name ||
                "Unknown client"}
            </h3>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {client?.company_name && <p>Contact: {client.name}</p>}

              {client?.email && <p>{client.email}</p>}
              {client?.phone && <p>{client.phone}</p>}
              {client?.address && <p>{client.address}</p>}
              {client?.trn && <p>TRN: {client.trn}</p>}
            </div>
          </div>

          <div className="md:text-right">
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium capitalize text-orange-700">
              {quotation.status}
            </span>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-8 md:justify-end">
                <dt className="text-muted-foreground">Issue date</dt>
                <dd>{formatDate(quotation.issue_date)}</dd>
              </div>

              <div className="flex justify-between gap-8 md:justify-end">
                <dt className="text-muted-foreground">Valid until</dt>
                <dd>{formatDate(quotation.valid_until)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm"
            style={{ minWidth: 700 + customColumns.length * 120 }}
          >
            <thead className="border-b border-border bg-slate-50">
              <tr>
                <th className="px-4 py-3">Description</th>

                {customColumns.map((column) => (
                  <th key={column.key} className="px-4 py-3">
                    {column.label}
                  </th>
                ))}

                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Unit price</th>
                <th className="px-4 py-3 text-right">VAT</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {quotation.quotation_items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">{item.description}</td>

                  {customColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-4 text-muted-foreground"
                    >
                      {getCustomValue(item.custom_values, column.key)}
                    </td>
                  ))}

                  <td className="px-4 py-4 text-right">
                    {Number(item.quantity).toFixed(2)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatCurrency(item.unit_price, quotation.currency)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {Number(item.vat_rate).toFixed(2)}%
                  </td>

                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(item.line_total, quotation.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QuotationStatusActions
          quotationId={quotation.id}
          currentStatus={quotation.status}
        />

        <div className="flex justify-end">
          <dl className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                {formatCurrency(quotation.subtotal, quotation.currency)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>
                {formatCurrency(quotation.discount, quotation.currency)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">VAT</dt>
              <dd>
                {formatCurrency(quotation.vat_amount, quotation.currency)}
              </dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="text-zen-orange">
                {formatCurrency(quotation.total, quotation.currency)}
              </dd>
            </div>
          </dl>
        </div>

        {quotation.notes && (
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold">Notes</h3>

            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {quotation.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}