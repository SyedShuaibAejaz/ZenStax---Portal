import { redirect } from "next/navigation";

import DashboardClient from "@/components/dashboard/DashboardClient";
import {
  buildDashboardMetrics,
  type DashboardCreditNote,
  type DashboardInvoice,
  type DashboardQuotation,
} from "@/lib/dashboard/metrics";
import { todayInDubai } from "@/lib/invoice-status";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace/get-current-workspace";

export const instant = false;

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { workspaceId, userId, role } = workspace;

  const [invoicesResult, quotationsResult, creditNotesResult, clientsResult, profileResult] =
    await Promise.all([
      supabase
        .from("invoices")
        .select(
          `id, invoice_number, status, currency, total, amount_paid, credited_amount,
           vat_amount, issue_date, due_date, created_at, client_id,
           clients ( name, company_name )`,
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),

      supabase
        .from("quotations")
        .select(
          `id, quotation_number, status, currency, total, issue_date, valid_until, created_at,
           clients ( name, company_name )`,
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),

      supabase
        .from("credit_notes")
        .select("total, vat_amount, issue_date, currency")
        .eq("workspace_id", workspaceId),

      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),

      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);

  const firstError =
    invoicesResult.error ?? quotationsResult.error ?? creditNotesResult.error;

  if (firstError) {
    return (
      <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Could not load the dashboard: {firstError.message}
      </div>
    );
  }

  const today = todayInDubai();

  const metrics = buildDashboardMetrics({
    invoices: (invoicesResult.data ?? []) as unknown as DashboardInvoice[],
    quotations: (quotationsResult.data ?? []) as unknown as DashboardQuotation[],
    creditNotes: (creditNotesResult.data ?? []) as DashboardCreditNote[],
    clientCount: clientsResult.count ?? 0,
    today,
  });

  const firstName = profileResult.data?.full_name?.trim().split(/\s+/)[0] || null;

  const todayLabel = new Intl.DateTimeFormat("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date());

  return (
    <DashboardClient
      metrics={metrics}
      greetingName={firstName}
      todayLabel={todayLabel}
      canCreate={role !== "viewer"}
    />
  );
}
