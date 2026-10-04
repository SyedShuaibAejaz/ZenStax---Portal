import { ClientForm } from "@/components/client-form";

export const instant = false;

export default function NewClientPage() {
  return (
    <section>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Client management
        </p>

        <h2 className="text-2xl font-semibold">Add client</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Save client information for future quotations and invoices.
        </p>
      </div>

      <ClientForm />
    </section>
  );
}