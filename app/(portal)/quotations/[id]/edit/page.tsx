import { notFound } from "next/navigation";

import {
  QuotationForm,
  type CustomColumn,
  type QuotationFormInitialValues,
} from "@/components/quotation/quotation-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type EditQuotationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function parseCustomValues(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(
      ([key, cellValue]) => [key, String(cellValue ?? "")],
    ),
  );
}

export default async function EditQuotationPage({
  params,
}: EditQuotationPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: clients, error: clientsError },
    { data: quotation, error: quotationError },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, company_name")
      .order("company_name", { ascending: true }),

    supabase
      .from("quotations")
      .select(
        `
          id,
          client_id,
          issue_date,
          valid_until,
          discount,
          notes,
          custom_columns,
          quotation_items (
            id,
            description,
            quantity,
            unit_price,
            vat_rate,
            custom_values
          )
        `,
      )
      .eq("id", id)
      .single(),
  ]);

  if (
    clientsError ||
    quotationError ||
    !clients ||
    !quotation
  ) {
    notFound();
  }

  const initialValues: QuotationFormInitialValues = {
    clientId: quotation.client_id,
    issueDate: quotation.issue_date,
    validUntil: quotation.valid_until ?? "",
    discount: String(quotation.discount ?? 0),
    notes: quotation.notes ?? "",
    customColumns: parseCustomColumns(quotation.custom_columns),
    items: quotation.quotation_items?.length
      ? quotation.quotation_items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unit_price),
          vatRate: String(item.vat_rate),
          customValues: parseCustomValues(item.custom_values),
        }))
      : [],
  };

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Sales documents
        </p>

        <h2 className="text-2xl font-semibold">
          Edit quotation
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the quotation details and line items.
        </p>
      </div>

      <QuotationForm
        clients={clients}
        quotationId={quotation.id}
        initialValues={initialValues}
      />
    </section>
  );
}