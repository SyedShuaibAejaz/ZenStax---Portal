import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceStatusActions } from "@/components/invoice/invoice-status-actions";
import { SaveInvoicePdfButton } from "@/components/invoice/save-invoice-button";
import { createClient } from "@/lib/supabase/server";
import { CancelInvoiceButton } from "@/components/invoice/cancel-invoice-button";
import { DeleteInvoiceButton } from "@/components/invoice/delete-invoice-button";

export const instant = false;

type InvoiceDetailsPageProps = {
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

type CustomColumn = { key: string; label: string };

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

export default async function InvoiceDetailsPage({
  params,
}: InvoiceDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      `
        id,
        invoice_number,
        issue_date,
        due_date,
        status,
        currency,
        subtotal,
        discount,
        vat_amount,
        total,
        amount_paid,
        credited_amount,
        notes,
        pdf_path,
        custom_columns,
        cancelled_at,
        cancellation_reason,
        clients (
          name,
          company_name,
          email,
          phone,
          address,
          trn
        ),
        credit_notes (
          id,
          credit_note_number,
          issue_date,
          reason,
          total
        ),
        invoice_items (
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

  if (error || !invoice) {
    notFound();
  }

  const client = Array.isArray(invoice.clients)
    ? invoice.clients[0]
    : invoice.clients;

  const customColumns = parseCustomColumns(invoice.custom_columns);

  const total = Number(invoice.total ?? 0);
  const credited = Number(invoice.credited_amount ?? 0);
  const paid = Number(invoice.amount_paid ?? 0);
  const netTotal = Math.max(total - credited, 0);
  const balance = netTotal - paid;

  const creditNotes = [...(invoice.credit_notes ?? [])].sort((a, b) =>
    a.credit_note_number.localeCompare(b.credit_note_number),
  );

  const canCredit =
    invoice.status !== "draft" &&
    invoice.status !== "cancelled" &&
    credited < total - 0.005;

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Sales document
          </p>

          <h2 className="text-2xl font-semibold">
            {invoice.invoice_number}
          </h2>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/invoices"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to invoices
          </Link>

          {invoice.pdf_path && (
            <a
              href={`/api/invoices/${invoice.id}/pdf/saved`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              View saved PDF
            </a>
          )}

          <SaveInvoicePdfButton invoiceId={invoice.id} />

          <Link
            href={`/api/invoices/${invoice.id}/pdf`}
            className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Download PDF
          </Link>

          {invoice.status === "draft" && (
            <DeleteInvoiceButton
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoice_number}
            />
          )}

          {canCredit && (
            <Link
              href={`/invoices/${invoice.id}/credit-note`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Issue credit note
            </Link>
          )}

          {canCredit && paid === 0 && (
              <CancelInvoiceButton
                invoiceId={invoice.id}
                invoiceNumber={invoice.invoice_number}
              />
            )}
        </div>
      </div>

      {invoice.status === "cancelled" && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">
            This invoice was cancelled
            {invoice.cancelled_at
              ? ` on ${formatDate(invoice.cancelled_at.slice(0, 10))}`
              : ""}
            .
          </p>
          {invoice.cancellation_reason && (
            <p className="mt-1">Reason: {invoice.cancellation_reason}</p>
          )}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bill to
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {client?.company_name || client?.name || "Unknown client"}
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
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
              {invoice.status.replace("_", " ")}
            </span>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-8 md:justify-end">
                <dt className="text-muted-foreground">Issue date</dt>
                <dd>{formatDate(invoice.issue_date)}</dd>
              </div>

              <div className="flex justify-between gap-8 md:justify-end">
                <dt className="text-muted-foreground">Due date</dt>
                <dd>{formatDate(invoice.due_date)}</dd>
              </div>
            </dl>
          </div>
        </div>

                <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm"
            style={{ minWidth: 640 + customColumns.length * 120 }}
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
              {invoice.invoice_items.map((item) => (
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
                    {formatCurrency(item.unit_price, invoice.currency)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {Number(item.vat_rate).toFixed(2)}%
                  </td>

                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(item.line_total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <dl className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(invoice.subtotal, invoice.currency)}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>{formatCurrency(invoice.discount, invoice.currency)}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">VAT</dt>
              <dd>{formatCurrency(invoice.vat_amount, invoice.currency)}</dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="text-zen-orange">
                {formatCurrency(invoice.total, invoice.currency)}
              </dd>
            </div>

            {credited > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Credited</dt>
                <dd>- {formatCurrency(credited, invoice.currency)}</dd>
              </div>
            )}

            {paid > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid</dt>
                <dd>- {formatCurrency(paid, invoice.currency)}</dd>
              </div>
            )}

            {(credited > 0 || paid > 0) && (
              <div className="flex justify-between font-semibold">
                <dt>{balance < 0 ? "Refund due to client" : "Balance due"}</dt>
                <dd>{formatCurrency(Math.abs(balance), invoice.currency)}</dd>
              </div>
            )}

            {invoice.status !== "cancelled" && (
              <InvoiceStatusActions
                invoiceId={invoice.id}
                currentStatus={invoice.status}
                currentAmountPaid={paid}
                total={netTotal}
              />
            )}
          </dl>
        </div>

        {creditNotes.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold">Credit notes</h3>

            <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
              {creditNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/credit-notes/${note.id}`}
                      className="font-medium text-zen-orange hover:underline"
                    >
                      {note.credit_note_number}
                    </Link>
                    <span className="ml-2 text-muted-foreground">
                      {formatDate(note.issue_date)} · {note.reason}
                    </span>
                  </div>
                  <span className="font-medium">
                    - {formatCurrency(note.total, invoice.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {invoice.notes && (
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold">Notes</h3>

            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}