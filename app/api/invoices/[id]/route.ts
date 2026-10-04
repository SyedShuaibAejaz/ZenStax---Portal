import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: invoice, error: invoiceError } =
      await supabase
        .from("invoices")
        .select(
          "id, invoice_number, status, amount_paid",
        )
        .eq("id", id)
        .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 },
      );
    }

    if (Number(invoice.amount_paid ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Paid invoices cannot be deleted.",
        },
        { status: 409 },
      );
    }

    if (
      invoice.status === "paid" ||
      invoice.status === "partially_paid"
    ) {
      return NextResponse.json(
        {
          error:
            "Paid or partially paid invoices cannot be deleted.",
        },
        { status: 409 },
      );
    }

    const { error: deleteItemsError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteItemsError) {
      return NextResponse.json(
        { error: deleteItemsError.message },
        { status: 500 },
      );
    }

    const { error: deleteInvoiceError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (deleteInvoiceError) {
      return NextResponse.json(
        { error: deleteInvoiceError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedInvoiceId: id,
      deletedInvoiceNumber: invoice.invoice_number,
    });
  } catch (error) {
    console.error("Invoice deletion failed:", error);

    return NextResponse.json(
      { error: "Could not delete invoice." },
      { status: 500 },
    );
  }
}