import { createElement, type ReactElement } from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import {
  InvoiceDocument,
  type InvoicePdfData,
} from "@/lib/pdf/invoice-document";
import { getBusinessDetails } from "@/lib/pdf/get-business-details";
import { createClient } from "@/lib/supabase/server";


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
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

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
          id,
          workspace_id,
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
          custom_columns,
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
            line_total,
            custom_values
          )
        `,
      )
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message ?? "Invoice not found." },
        { status: 404 },
      );
    }

    const business = await getBusinessDetails(
      supabase,
      invoice.workspace_id,
    );

    const document = createElement(InvoiceDocument, {
      data: {
        ...(invoice as unknown as InvoicePdfData),
        business,
      },
    }) as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(document);

    const safeNumber = invoice.invoice_number.replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );

    const storagePath = `invoices/${invoice.id}/${safeNumber}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("zenstax-private")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ pdf_path: storagePath })
      .eq("id", invoice.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      path: storagePath,
    });
  } catch (error) {
    console.error("Invoice PDF save failed:", error);

    return NextResponse.json(
      { error: "Could not save invoice PDF." },
      { status: 500 },
    );
  }
}