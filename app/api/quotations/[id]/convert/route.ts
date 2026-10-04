import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type QuotationItem = {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
};

type Quotation = {
  id: string;
  workspace_id: string;
  client_id: string;
  status: string;
  currency: string;
  subtotal: number | string;
  discount: number | string;
  vat_amount: number | string;
  total: number | string;
  notes: string | null;
  quotation_items:
    | QuotationItem[]
    | null;
};

function getDefaultDueDate(
  daysFromToday: number,
) {
  const dueDate = new Date();

  dueDate.setDate(
    dueDate.getDate() + daysFromToday,
  );

  return dueDate
    .toISOString()
    .slice(0, 10);
}

function errorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      id: quotationId,
    } = await context.params;

    if (!quotationId) {
      return errorResponse(
        "Quotation ID is required.",
        400,
      );
    }

    const supabase =
      await createClient();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser();

    const user = authData?.user;

    if (authError || !user) {
      return errorResponse(
        "Unauthorized.",
        401,
      );
    }

    /*
     * Find the user's workspace.
     */
    const {
      data: membership,
      error: membershipError,
    } =
      await supabase
        .from("workspace_members")
        .select(
          "workspace_id, role",
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

    if (
      membershipError ||
      !membership?.workspace_id
    ) {
      return errorResponse(
        membershipError?.message ??
          "No workspace membership was found.",
        403,
      );
    }

    const workspaceId =
      membership.workspace_id;

    /*
     * Optional role check.
     */
    const role =
      String(membership.role)
        .toLowerCase();

    if (
      role !== "owner" &&
      role !== "admin" &&
      role !== "finance"
    ) {
      return errorResponse(
        "You do not have permission to create invoices.",
        403,
      );
    }

    /*
     * Load the quotation, including
     * workspace_id.
     */
    const {
      data: quotationData,
      error: quotationError,
    } =
      await supabase
        .from("quotations")
        .select(
          `
            id,
            workspace_id,
            client_id,
            status,
            currency,
            subtotal,
            discount,
            vat_amount,
            total,
            notes,
            quotation_items (
              description,
              quantity,
              unit_price,
              vat_rate,
              line_total
            )
          `,
        )
        .eq("id", quotationId)
        .eq(
          "workspace_id",
          workspaceId,
        )
        .single();

    if (
      quotationError ||
      !quotationData
    ) {
      return errorResponse(
        quotationError?.message ??
          "Quotation not found.",
        404,
      );
    }

    const quotation =
      quotationData as unknown as Quotation;

    if (
      quotation.workspace_id !==
      workspaceId
    ) {
      return errorResponse(
        "Quotation does not belong to this workspace.",
        403,
      );
    }

    if (
      quotation.status !== "accepted"
    ) {
      return errorResponse(
        "Only accepted quotations can be converted into invoices.",
        400,
      );
    }

    /*
     * Check if an invoice already exists.
     */
    const {
      data: existingInvoice,
      error: existingInvoiceError,
    } =
      await supabase
        .from("invoices")
        .select(
          "id, invoice_number",
        )
        .eq(
          "quotation_id",
          quotation.id,
        )
        .eq(
          "workspace_id",
          workspaceId,
        )
        .maybeSingle();

    if (existingInvoiceError) {
      return errorResponse(
        existingInvoiceError.message,
        500,
      );
    }

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        invoiceId:
          existingInvoice.id,
        invoiceNumber:
          existingInvoice.invoice_number,
        alreadyExists: true,
      });
    }

    /*
     * Generate the invoice number.
     */
    const {
      data: invoiceNumber,
      error: invoiceNumberError,
    } =
      await supabase.rpc(
        "next_invoice_number",
      );

    if (
      invoiceNumberError ||
      !invoiceNumber
    ) {
      return errorResponse(
        invoiceNumberError?.message ??
          "Could not generate invoice number.",
        500,
      );
    }

    /*
     * Create the invoice.
     *
     * workspace_id is required.
     * Do not set id: quotation.id.
     */
    const {
      data: invoice,
      error: invoiceError,
    } =
      await supabase
        .from("invoices")
        .insert({
          workspace_id: workspaceId,
          quotation_id: quotation.id,
          invoice_number: String(
            invoiceNumber,
          ),
          client_id: quotation.client_id,
          issue_date: new Date()
            .toISOString()
            .slice(0, 10),
          due_date:
            getDefaultDueDate(30),
          status: "draft",
          currency: quotation.currency,
          subtotal: Number(
            quotation.subtotal,
          ),
          discount: Number(
            quotation.discount,
          ),
          vat_amount: Number(
            quotation.vat_amount,
          ),
          total: Number(
            quotation.total,
          ),
          amount_paid: 0,
          notes: quotation.notes,
          created_by: user.id,
        })
        .select(
          "id, invoice_number, due_date",
        )
        .single();

    if (
      invoiceError ||
      !invoice
    ) {
      console.error(
        "Invoice creation failed:",
        invoiceError,
      );

      return errorResponse(
        invoiceError?.message ??
          "Could not create invoice.",
        500,
      );
    }

    /*
     * Copy quotation items.
     */
    const quotationItems =
      quotation.quotation_items ?? [];

    if (quotationItems.length > 0) {
      const invoiceItems =
        quotationItems.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: Number(
            item.quantity,
          ),
          unit_price: Number(
            item.unit_price,
          ),
          vat_rate: Number(
            item.vat_rate,
          ),
          line_total: Number(
            item.line_total,
          ),
        }));

      const {
        error: itemsError,
      } =
        await supabase
          .from("invoice_items")
          .insert(invoiceItems);

      if (itemsError) {
        await supabase
          .from("invoices")
          .delete()
          .eq("id", invoice.id)
          .eq(
            "workspace_id",
            workspaceId,
          );

        return errorResponse(
          itemsError.message,
          500,
        );
      }
    }

    /*
     * Mark quotation as converted.
     */
    const {
      error: quotationUpdateError,
    } =
      await supabase
        .from("quotations")
        .update({
          status: "converted",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", quotation.id)
        .eq(
          "workspace_id",
          workspaceId,
        );

    if (quotationUpdateError) {
      await supabase
        .from("invoice_items")
        .delete()
        .eq(
          "invoice_id",
          invoice.id,
        );

      await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id)
        .eq(
          "workspace_id",
          workspaceId,
        );

      return errorResponse(
        quotationUpdateError.message,
        500,
      );
    }

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceNumber:
        invoice.invoice_number,
      dueDate: invoice.due_date,
      alreadyExists: false,
    });
  } catch (error) {
    console.error(
      "Quotation conversion failed:",
      error,
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Could not convert quotation.",
      500,
    );
  }
}