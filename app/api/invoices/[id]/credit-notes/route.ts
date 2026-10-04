import { NextResponse } from "next/server";

import { createCreditNote } from "@/lib/credit-notes";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    reason?: string;
    items?: { invoice_item_id?: string; quantity?: number | string }[];
  };

  const reason = body.reason?.trim() ?? "";

  if (reason.length < 3) {
    return NextResponse.json(
      { error: "Enter a reason for the credit note." },
      { status: 400 },
    );
  }

  const items = (body.items ?? [])
    .map((item) => ({
      invoice_item_id: String(item.invoice_item_id ?? ""),
      quantity: Number(item.quantity ?? 0),
    }))
    .filter(
      (item) =>
        item.invoice_item_id && Number.isFinite(item.quantity) && item.quantity > 0,
    );

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Enter a quantity for at least one line." },
      { status: 400 },
    );
  }

  const result = await createCreditNote(supabase, id, reason, items);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, creditNoteId: result.creditNoteId });
}
