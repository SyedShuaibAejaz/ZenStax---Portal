import { redirect } from "next/navigation";

import { CompanySettingsForm } from "@/components/settings/company-settings-form";
import { createClient } from "@/lib/supabase/server";
import {
  canEditSettings,
  getCurrentWorkspace,
} from "@/lib/workspace/get-current-workspace";

import { TEXT_FIELDS, type CompanySettingsValues } from "./types";

export const instant = false;

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  // The settings layout already sends non-admins away; this is a backstop.
  if (!canEditSettings(workspace.role)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("workspace_id", workspace.workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load company settings: ${error.message}`);
  }

  const row = (settings ?? {}) as Record<string, unknown>;

  const initialValues = Object.fromEntries(
    [
      ...TEXT_FIELDS,
      "default_vat_rate",
      "quotation_validity_days",
    ].map((field) => [field, row[field] == null ? "" : String(row[field])]),
  ) as CompanySettingsValues;

  if (!initialValues.default_currency) initialValues.default_currency = "AED";
  if (!initialValues.default_vat_rate) initialValues.default_vat_rate = "5";
  if (!initialValues.quotation_validity_days) {
    initialValues.quotation_validity_days = "30";
  }
  if (!initialValues.country) {
    initialValues.country = "United Arab Emirates";
  }

  let logoUrl: string | null = null;

  if (typeof row.logo_path === "string" && row.logo_path) {
    const { data: signed } = await supabase.storage
      .from("zenstax-private")
      .createSignedUrl(row.logo_path, 60 * 10);

    logoUrl = signed?.signedUrl ?? null;
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h2 className="text-2xl font-semibold">Company settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details appear on your quotations and invoices.
        </p>
      </div>

      <CompanySettingsForm
        initialValues={initialValues}
        logoUrl={logoUrl}
        canEdit={canEditSettings(workspace.role)}
      />
    </section>
  );
}