import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteClientButton } from "@/components/delete-client-button";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type ClientDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailsPage({
  params,
}: ClientDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        
        <div>
          <Link
          href={`/clients`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#E85E17]"
        >
          <span aria-hidden="true">
            ←
          </span>
          Back to clients
        </Link>
          <p className="text-sm text-muted-foreground">
            Client profile
          </p>

          <h2 className="text-2xl font-semibold">
            {client.company_name || client.name}
          </h2>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-lg bg-zen-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Edit client
          </Link>

          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Contact information</h3>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Contact name</dt>
              <dd className="font-medium">{client.name}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd className="font-medium">
                {client.company_name || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{client.email || "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{client.phone || "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">TRN</dt>
              <dd className="font-medium">{client.trn || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Address and notes</h3>

          <div className="space-y-5 text-sm">
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="whitespace-pre-wrap">
                {client.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Notes</p>
              <p className="whitespace-pre-wrap">
                {client.notes || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}