import { NextResponse } from "next/server";
import {
  createClient as createSupabaseAdminClient,
} from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const bucketName =
  "workspace-branding";

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

function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin environment variables are missing.",
    );
  }

  return createSupabaseAdminClient(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function isValidColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function getExtension(
  file: File,
) {
  const typeMap: Record<
    string,
    string
  > = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };

  return typeMap[file.type] ?? null;
}

export async function PATCH(
  request: Request,
) {
  try {
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

    const formData =
      await request.formData();

    const workspaceId =
      String(
        formData.get("workspaceId") ?? "",
      ).trim();

    const primaryColor =
      String(
        formData.get("primaryColor") ??
          "#FF7425",
      ).trim();

    const secondaryColor =
      String(
        formData.get("secondaryColor") ??
          "#071B31",
      ).trim();

    const logo =
      formData.get("logo");

    if (!workspaceId) {
      return jsonError(
        "Workspace ID is required.",
        400,
      );
    }

    if (!isValidColor(primaryColor)) {
      return jsonError(
        "Primary color must be a valid hex color.",
        400,
      );
    }

    if (!isValidColor(secondaryColor)) {
      return jsonError(
        "Secondary color must be a valid hex color.",
        400,
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
        "Branding permission check failed:",
        permissionError,
      );

      return jsonError(
        "Could not verify branding permissions.",
        500,
      );
    }

    if (!canEdit) {
      return jsonError(
        "You do not have permission to edit branding.",
        403,
      );
    }

    const adminSupabase =
      createAdminClient();

    let logoUrl: string | null = null;

    if (
      logo instanceof File &&
      logo.size > 0
    ) {
      if (logo.size > 2 * 1024 * 1024) {
        return jsonError(
          "Logo must be smaller than 2 MB.",
          400,
        );
      }

      const extension =
        getExtension(logo);

      if (!extension) {
        return jsonError(
          "Only PNG, JPG, WEBP, and SVG logos are supported.",
          400,
        );
      }

      const filePath =
        `${workspaceId}/logo.${extension}`;

      const fileBuffer =
        Buffer.from(
          await logo.arrayBuffer(),
        );

      const {
        error: uploadError,
      } =
        await adminSupabase.storage
          .from(bucketName)
          .upload(
            filePath,
            fileBuffer,
            {
              contentType: logo.type,
              upsert: true,
              cacheControl: "3600",
            },
          );

      if (uploadError) {
        console.error(
          "Branding logo upload failed:",
          uploadError,
        );

        return jsonError(
          uploadError.message,
          500,
        );
      }

      const {
        data: publicUrlData,
      } =
        adminSupabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

      logoUrl =
        publicUrlData.publicUrl;
    }

    const updates: {
      primary_color: string;
      secondary_color: string;
      updated_at: string;
      logo_url?: string;
    } = {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      updated_at:
        new Date().toISOString(),
    };

    if (logoUrl) {
      updates.logo_url = logoUrl;
    }

    const {
      data,
      error: updateError,
    } =
      await adminSupabase
        .from("workspaces")
        .update(updates)
        .eq("id", workspaceId)
        .select(
          "id, logo_url, primary_color, secondary_color, updated_at",
        )
        .single();

    if (updateError) {
      console.error(
        "Branding settings update failed:",
        updateError,
      );

      return jsonError(
        updateError.message,
        500,
      );
    }

    return NextResponse.json({
      success: true,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor:
        data.secondary_color,
    });
  } catch (error) {
    console.error(
      "Branding update failed:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not update branding.",
      500,
    );
  }
}