import { QuotationForm } from "@/components/quotation/quotation-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function NewQuotationPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, company_name")
    .order("company_name", { ascending: true });

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load clients
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error.message}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Sales documents
        </p>

        <h2 className="text-2xl font-semibold">
          Create quotation
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Prepare a quotation for an existing client.
        </p>
      </div>

      {!clients?.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-medium text-amber-900">
            Add a client before creating a quotation.
          </p>
        </div>
      ) : (
        <QuotationForm clients={clients} />
      )}
    </section>
  );
}