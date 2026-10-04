import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
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
    };

    const reason = body.reason?.trim() ?? "";

    if (reason.length < 3) {
      return NextResponse.json(
        { error: "Enter a reason for cancelling this invoice." },
        { status: 400 },
      );
    }

    const { data: invoice, error: lookupError } = await supabase
      .from("invoices")
      .select("id, invoice_number, status, amount_paid")
      .eq("id", id)
      .single();

    if (lookupError || !invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (invoice.status === "cancelled") {
      return NextResponse.json(
        { error: "This invoice is already cancelled." },
        { status: 409 },
      );
    }

    if (invoice.status === "draft") {
      return NextResponse.json(
        { error: "Draft invoices can simply be deleted." },
        { status: 409 },
      );
    }

    if (Number(invoice.amount_paid ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This invoice has payments recorded. Record the refund before cancelling.",
        },
        { status: 409 },
      );
    }

    // The database fills cancelled_at / cancelled_by and checks the rules.
    const { data: updated, error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_by: user.id,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        {
          error:
            updateError?.message ??
            "You do not have permission to cancel this invoice.",
        },
        { status: updateError ? 400 : 403 },
      );
    }

    return NextResponse.json({
      success: true,
      cancelledInvoiceNumber: invoice.invoice_number,
    });
  } catch (error) {
    console.error("Invoice cancellation failed:", error);

    return NextResponse.json(
      { error: "Could not cancel invoice." },
      { status: 500 },
    );
  }
}
