import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { getBusinessDetails } from "@/lib/pdf/get-business-details";
import { attachmentHeader, buildPdfFileName } from "@/lib/pdf/file-name";
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

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: creditNote, error } = await supabase
      .from("credit_notes")
      .select(
        `
          id,
          workspace_id,
          credit_note_number,
          issue_date,
          status,
          reason,
          currency,
          subtotal,
          discount,
          vat_amount,
          total,
          custom_columns,
          invoices (
            invoice_number,
            issue_date
          ),
          clients (
            name,
            company_name,
            email,
            phone,
            address,
            trn
          ),
          credit_note_items (
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

    if (error || !creditNote || !creditNote.workspace_id) {
      return NextResponse.json(
        { error: error?.message ?? "Credit note not found." },
        { status: 404 },
      );
    }

    const invoice = Array.isArray(creditNote.invoices)
      ? creditNote.invoices[0]
      : creditNote.invoices;

    const business = await getBusinessDetails(supabase, creditNote.workspace_id);

    const data = {
      id: creditNote.id,
      invoice_number: creditNote.credit_note_number,
      issue_date: creditNote.issue_date,
      due_date: null,
      status: creditNote.status,
      currency: creditNote.currency,
      subtotal: creditNote.subtotal,
      discount: creditNote.discount,
      vat_amount: creditNote.vat_amount,
      total: creditNote.total,
      amount_paid: 0,
      notes: null,
      custom_columns: creditNote.custom_columns,
      clients: creditNote.clients,
      invoice_items: creditNote.credit_note_items,
      business,
      credit_note: {
        reason: creditNote.reason,
        original_invoice_number: invoice?.invoice_number ?? "—",
        original_issue_date: invoice?.issue_date ?? creditNote.issue_date,
      },
    } as unknown as InvoicePdfData;

    const pdfBuffer = await renderToBuffer(<InvoiceDocument data={data} />);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": attachmentHeader(
          buildPdfFileName(
            creditNote.credit_note_number,
            creditNote.clients,
            "Credit Note",
          ),
        ),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Credit note PDF generation failed:", error);

    return NextResponse.json(
      { error: "Could not generate credit note PDF." },
      { status: 500 },
    );
  }
}
