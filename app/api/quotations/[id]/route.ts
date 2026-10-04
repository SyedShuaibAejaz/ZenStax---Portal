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

    const { data: quotation, error: quotationError } =
      await supabase
        .from("quotations")
        .select("id, status, quotation_number")
        .eq("id", id)
        .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: "Quotation not found." },
        { status: 404 },
      );
    }

    if (quotation.status === "converted") {
      return NextResponse.json(
        {
          error:
            "Converted quotations cannot be deleted. Delete or reverse the related invoice first.",
        },
        { status: 409 },
      );
    }

    const { data: relatedInvoice, error: invoiceLookupError } =
      await supabase
        .from("invoices")
        .select("id")
        .eq("quotation_id", id)
        .maybeSingle();

    if (invoiceLookupError) {
      return NextResponse.json(
        { error: invoiceLookupError.message },
        { status: 500 },
      );
    }

    if (relatedInvoice) {
      return NextResponse.json(
        {
          error:
            "This quotation is linked to an invoice and cannot be deleted.",
        },
        { status: 409 },
      );
    }

    const { error: deleteQuotationError } = await supabase
      .from("quotations")
      .delete()
      .eq("id", id);

    if (deleteQuotationError) {
      return NextResponse.json(
        { error: deleteQuotationError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedQuotationId: id,
      deletedQuotationNumber: quotation.quotation_number,
    });
  } catch (error) {
    console.error("Quotation deletion failed:", error);

    return NextResponse.json(
      { error: "Could not delete quotation." },
      { status: 500 },
    );
  }
}