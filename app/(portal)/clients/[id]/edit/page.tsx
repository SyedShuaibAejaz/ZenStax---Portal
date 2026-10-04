import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/client-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type EditClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientPage({
  params,
}: EditClientPageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: client,
    error,
  } =
    await supabase
      .from("clients")
      .select(
        "id, name, company_name, email, phone, address, trn, notes",
      )
      .eq("id", id)
      .single();

  if (error || !client) {
    notFound();
  }

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/clients/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#E85E17]"
        >
          <span aria-hidden="true">
            ←
          </span>
          Back to client
        </Link>

        <p className="text-sm text-muted-foreground">
          Client management
        </p>

        <h2 className="text-2xl font-semibold">
          Edit client
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the stored client information.
        </p>
      </div>

      <ClientForm
        clientId={client.id}
        initialValues={{
          name: client.name,
          company_name:
            client.company_name ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          trn: client.trn ?? "",
          notes: client.notes ?? "",
        }}
      />
    </section>
  );
}