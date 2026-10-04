import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type UpdateSettingsRequest = {
  workspaceId?: string;
  name?: string;
  legalName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

function jsonError(
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

export async function PATCH(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as UpdateSettingsRequest;

    const workspaceId =
      body.workspaceId?.trim();

    if (!workspaceId) {
      return jsonError(
        "Workspace ID is required.",
        400,
      );
    }

    const supabase = await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError(
        "Unauthorized.",
        401,
      );
    }

    const {
      data: canEdit,
      error: permissionError,
    } =
      await supabase.rpc(
        "can_edit_company_settings",
        {
          p_workspace_id: workspaceId,
          p_user_id: user.id,
        },
      );

    if (permissionError) {
      console.error(
        "Settings permission check failed:",
        permissionError,
      );

      return jsonError(
        "Could not verify settings permissions.",
        500,
      );
    }

    if (!canEdit) {
      return jsonError(
        "You do not have permission to edit company settings.",
        403,
      );
    }

    const updates = {
      name: body.name?.trim() ?? "",
      legal_name:
        body.legalName?.trim() ?? "",
      phone: body.phone?.trim() ?? "",
      email:
        body.email?.trim().toLowerCase() ?? "",
      address: body.address?.trim() ?? "",
      updated_at:
        new Date().toISOString(),
    };

    const {
      data,
      error: updateError,
    } =
      await supabase
        .from("workspaces")
        .update(updates)
        .eq("id", workspaceId)
        .select(
          "id, name, legal_name, phone, email, address, updated_at",
        )
        .single();

    if (updateError) {
      console.error(
        "Workspace settings update failed:",
        updateError,
      );

      return jsonError(
        updateError.message,
        500,
      );
    }

    return NextResponse.json({
      success: true,
      workspace: data,
    });
  } catch (error) {
    console.error(
      "Company settings update failed:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not update company settings.",
      500,
    );
  }
}