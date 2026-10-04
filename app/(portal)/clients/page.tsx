import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select(
      "id, name, company_name, email, phone, address, trn, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load clients
        </h2>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Clients</h2>
          <p className="text-sm text-slate-500">
            Store reusable client information.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Add client
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
            </tr>
          </thead>

          <tbody>
            {clients?.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3 font-medium">
  <Link
    href={`/clients/${client.id}`}
    className="text-zen-orange hover:underline"
  >
    {client.name}
  </Link>
</td>
                <td className="px-4 py-3">
                  {client.company_name || "—"}
                </td>
                <td className="px-4 py-3">
                  {client.email || "—"}
                </td>
                <td className="px-4 py-3">
                  {client.phone || "—"}
                </td>
              </tr>
            ))}

            {!clients?.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No clients added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}