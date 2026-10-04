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

    // Only drafts can be deleted. Issued invoices are permanent records and
    // must be cancelled instead (the database enforces this as well).
    if (invoice.status !== "draft") {
      return NextResponse.json(
        {
          error:
            "Issued invoices cannot be deleted. Cancel the invoice instead.",
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