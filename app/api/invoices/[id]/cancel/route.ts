import { NextResponse } from "next/server";

import { createCreditNote } from "@/lib/credit-notes";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Cancels an issued invoice by issuing a credit note for everything that is
 * left on it. The database marks the invoice cancelled once it is fully
 * credited and unpaid.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() ?? "";

  if (reason.length < 3) {
    return NextResponse.json(
      { error: "Enter a reason for cancelling this invoice." },
      { status: 400 },
    );
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("amount_paid")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (Number(invoice.amount_paid ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "This invoice has payments recorded. Issue a credit note and record the refund instead.",
      },
      { status: 409 },
    );
  }

  const result = await createCreditNote(supabase, id, reason, null);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, creditNoteId: result.creditNoteId });
}
