import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  QuotationDocument,
  type QuotationPdfData,
} from "@/lib/pdf/quotation-document";
import { attachmentHeader, buildPdfFileName } from "@/lib/pdf/file-name";
import { createClient } from "@/lib/supabase/server";


type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: quotation, error } = await supabase
      .from("quotations")
      .select(
        `
          id,
          quotation_number,
          issue_date,
          valid_until,
          currency,
          subtotal,
          discount,
          vat_amount,
          total,
          notes,
          custom_columns,
          clients (
            name,
            company_name,
            email,
            phone,
            address,
            trn
          ),
          quotation_items (
            id,
            description,
            quantity,
            unit_price,
            vat_rate,
            line_total,
            custom_values
          )
        `,
      )
      .eq("id", id)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { error: error?.message ?? "Quotation not found." },
        { status: 404 },
      );
    }

    const pdfBuffer = await renderToBuffer(
      <QuotationDocument
        data={quotation as unknown as QuotationPdfData}
      />,
    );

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": attachmentHeader(
          buildPdfFileName(quotation.quotation_number, quotation.clients, "Quotation"),
        ),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Quotation PDF download failed:", error);

    return NextResponse.json(
      { error: "Could not download quotation PDF." },
      { status: 500 },
    );
  }
}