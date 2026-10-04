import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  InvoiceDocument,
  type InvoicePdfData,
} from "@/lib/pdf/invoice-document";
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
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        `
          id,
          invoice_number,
          issue_date,
          due_date,
          status,
          currency,
          subtotal,
          discount,
          vat_amount,
          total,
          amount_paid,
          notes,
          clients (
            name,
            company_name,
            email,
            phone,
            address,
            trn
          ),
          invoice_items (
            id,
            description,
            quantity,
            unit_price,
            vat_rate,
            line_total
          )
        `,
      )
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        {
          error:
            error?.message ?? "Invoice not found.",
        },
        { status: 404 },
      );
    }

    const pdfBuffer = await renderToBuffer(
      <InvoiceDocument
        data={invoice as unknown as InvoicePdfData}
      />,
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);

    return NextResponse.json(
      { error: "Could not generate invoice PDF." },
      { status: 500 },
    );
  }
}