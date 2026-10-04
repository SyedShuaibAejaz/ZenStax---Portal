import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type CreditNoteLineInput = {
  invoice_item_id: string;
  quantity: number;
};

/**
 * Creates a credit note through the database function, which checks the
 * role, validates quantities, numbers it (ZEN-CN-0001…) and cancels the
 * invoice when it is credited in full. Pass `items = null` to credit
 * everything that is left on the invoice.
 */
export async function createCreditNote(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
  reason: string,
  items: CreditNoteLineInput[] | null,
) {
  const { data, error } = await supabase.rpc("create_credit_note", {
    p_invoice_id: invoiceId,
    p_reason: reason,
    ...(items ? { p_items: items } : {}),
  });

  if (error) {
    const status = error.code === "42501" ? 403 : 400;
    return { creditNoteId: null, error: error.message, status } as const;
  }

  return { creditNoteId: data as string, error: null, status: 200 } as const;
}
