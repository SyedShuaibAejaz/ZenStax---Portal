import type { InvoicePdfBusiness } from "@/lib/pdf/invoice-document";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function joinLines(
  parts: (string | null | undefined)[],
  separator: string,
) {
  const text = parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(separator);

  return text || null;
}

/**
 * Company details printed on invoices.
 * Uses get_document_business_details so every workspace role can render
 * PDFs, while the company_settings table itself stays owner/admin only.
 */
export async function getBusinessDetails(
  supabase: SupabaseServerClient,
  workspaceId: string | null,
): Promise<InvoicePdfBusiness> {
  if (!workspaceId) {
    return { business_name: "ZenStax" };
  }

  const { data: settings, error } = await supabase
    .rpc("get_document_business_details", { p_workspace_id: workspaceId })
    .maybeSingle();

  if (error) {
    console.error("Could not load company details:", error.message);
  }

  if (!settings) {
    return { business_name: "ZenStax" };
  }

  const cityLine = joinLines(
    [settings.city, settings.emirate, settings.postal_code],
    ", ",
  );

  const address = joinLines(
    [
      settings.address_line_1,
      settings.address_line_2,
      cityLine,
      settings.country,
    ],
    "\n",
  );

  const bankDetails = joinLines(
    [
      settings.bank_name && `Bank: ${settings.bank_name}`,
      settings.bank_account_name &&
        `Account name: ${settings.bank_account_name}`,
      settings.bank_account_number &&
        `Account number: ${settings.bank_account_number}`,
      settings.iban && `IBAN: ${settings.iban}`,
      settings.swift_code && `SWIFT: ${settings.swift_code}`,
    ],
    "\n",
  );

  const terms = joinLines(
    [settings.payment_terms, settings.invoice_footer],
    "\n\n",
  );

  return {
    business_name: settings.trading_name || settings.legal_name || "ZenStax",
    legal_name: settings.legal_name,
    address,
    email: settings.email,
    phone: settings.phone,
    website: settings.website,
    trn: settings.trn,
    bank_details: bankDetails,
    terms_and_conditions: terms,
  };
}
