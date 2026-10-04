"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  canEditSettings,
  getCurrentWorkspace,
} from "@/lib/workspace/get-current-workspace";

import {
  TEXT_FIELDS,
  type CompanySettingsValues,
  type SettingsFormState,
} from "./types";

function submittedValues(formData: FormData): Partial<CompanySettingsValues> {
  const fields = [
    ...TEXT_FIELDS,
    "default_vat_rate",
    "quotation_validity_days",
  ] as (keyof CompanySettingsValues)[];

  return Object.fromEntries(
    fields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  );
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

export async function saveCompanySettings(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const result = await save(formData);

  return result.status === "error"
    ? { ...result, values: submittedValues(formData) }
    : result;
}

async function save(formData: FormData): Promise<SettingsFormState> {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return {
      status: "error",
      message: "You are not signed in or not part of a workspace.",
      fieldErrors: {},
    };
  }

  if (!canEditSettings(workspace.role)) {
    return {
      status: "error",
      message: "Only owners and admins can change company settings.",
      fieldErrors: {},
    };
  }

  /* ---------- Read and validate ---------- */

  const text = (key: keyof CompanySettingsValues) => readText(formData, key);
  const fieldErrors: SettingsFormState["fieldErrors"] = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const legalName = text("legal_name");
  if (!legalName) {
    fieldErrors.legal_name = "Legal name is required.";
  }

  const email = text("email");
  if (email && !emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  const signatoryEmail = text("authorized_signatory_email");
  if (signatoryEmail && !emailPattern.test(signatoryEmail)) {
    fieldErrors.authorized_signatory_email = "Enter a valid email address.";
  }

  let trn = text("trn");
  if (trn) {
    trn = trn.replace(/\s/g, "");
    if (!/^\d{15}$/.test(trn)) {
      fieldErrors.trn = "A UAE TRN has exactly 15 digits.";
    }
  }

  const vatText = text("default_vat_rate");
  const vatRate = vatText === null ? 5 : Number(vatText);
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
    fieldErrors.default_vat_rate = "VAT must be between 0 and 100.";
  }

  const validityText = text("quotation_validity_days");
  const validityDays = validityText === null ? 30 : Number(validityText);
  if (!Number.isInteger(validityDays) || validityDays <= 0) {
    fieldErrors.quotation_validity_days = "Enter a whole number above 0.";
  }

  if (Object.keys(fieldErrors).length > 0 || !legalName) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const payload = {
    legal_name: legalName,
    trading_name: text("trading_name"),
    email,
    phone: text("phone"),
    website: text("website"),
    address_line_1: text("address_line_1"),
    address_line_2: text("address_line_2"),
    city: text("city"),
    emirate: text("emirate"),
    postal_code: text("postal_code"),
    country: text("country") ?? "United Arab Emirates",
    trn,
    default_currency: (text("default_currency") ?? "AED").toUpperCase(),
    default_vat_rate: vatRate,
    quotation_validity_days: validityDays,
    bank_name: text("bank_name"),
    bank_account_name: text("bank_account_name"),
    bank_account_number: text("bank_account_number"),
    iban: text("iban")?.replace(/\s/g, "").toUpperCase() ?? null,
    swift_code: text("swift_code")?.toUpperCase() ?? null,
    payment_terms: text("payment_terms"),
    invoice_footer: text("invoice_footer"),
    quotation_footer: text("quotation_footer"),
    authorized_signatory_name: text("authorized_signatory_name"),
    authorized_signatory_title: text("authorized_signatory_title"),
    authorized_signatory_email: signatoryEmail,
  };

  const supabase = await createClient();

  /* ---------- Save: update the workspace row, or create it ---------- */

  const { data: existing, error: lookupError } = await supabase
    .from("company_settings")
    .select("id")
    .eq("workspace_id", workspace.workspaceId)
    .maybeSingle();

  if (lookupError) {
    return {
      status: "error",
      message: `Could not load settings: ${lookupError.message}`,
      fieldErrors: {},
    };
  }

  // .select() after the write makes a blocked or missed write visible.
  // Without it, an update that matches 0 rows "succeeds" silently.
  const saved = existing
    ? await supabase
        .from("company_settings")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabase
        .from("company_settings")
        .insert({
          ...payload,
          workspace_id: workspace.workspaceId,
          created_by: workspace.userId,
        })
        .select("id")
        .single();

  if (saved.error || !saved.data) {
    return {
      status: "error",
      message: `Settings were not saved: ${
        saved.error?.message ?? "no row was updated"
      }`,
      fieldErrors: {},
    };
  }

  revalidatePath("/settings");
  revalidatePath("/quotations", "layout");
  revalidatePath("/invoices", "layout");

  return {
    status: "success",
    message: "Settings saved.",
    fieldErrors: {},
  };
}