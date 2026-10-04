import { createElement, type ReactElement } from "react";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import {
  QuotationDocument,
  type QuotationPdfData,
} from "@/lib/pdf/quotation-document";
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

    const { data: quotation, error: quotationError } =
      await supabase
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

    if (quotationError || !quotation) {
      return NextResponse.json(
        {
          error:
            quotationError?.message ?? "Quotation not found.",
        },
        { status: 404 },
      );
    }

    const document = createElement(QuotationDocument, {
      data: quotation as unknown as QuotationPdfData,
    }) as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(document);

    const safeNumber = quotation.quotation_number.replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );

    const storagePath =
      `quotations/${quotation.id}/${safeNumber}.pdf`;

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
      .from("quotations")
      .update({ pdf_path: storagePath })
      .eq("id", quotation.id);

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
    console.error("Quotation PDF save failed:", error);

    return NextResponse.json(
      { error: "Could not save quotation PDF." },
      { status: 500 },
    );
  }
}