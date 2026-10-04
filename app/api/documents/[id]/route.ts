import { NextResponse } from "next/server";
import {
  createClient as createSupabaseAdminClient,
} from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const BUCKET_NAME =
  "workspace-documents";

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



export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      id: documentId,
    } = await context.params;

    if (!documentId) {
      return jsonError(
        "Document ID is required.",
        400,
      );
    }

    /*
     * Use the authenticated client to
     * identify the current user.
     */
    const supabase =
      await createClient();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser();

    const user = authData?.user;

    if (authError || !user) {
      return jsonError(
        "Unauthorized.",
        401,
      );
    }

    /*
     * Load document metadata using the
     * authenticated user.
     */
    const {
      data: document,
      error: documentError,
    } =
      await supabase
        .from("documents")
        .select(
          `
            id,
            workspace_id,
            file_path,
            file_name,
            title
          `,
        )
        .eq("id", documentId)
        .maybeSingle();

    if (documentError) {
      console.error(
        "Document lookup failed:",
        documentError,
      );

      return jsonError(
        documentError.message,
        500,
      );
    }

    if (!document) {
      return jsonError(
        "Document not found.",
        404,
      );
    }

    /*
     * Verify that the user is an admin
     * or owner of the document workspace.
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
        .eq(
          "workspace_id",
          document.workspace_id,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Membership lookup failed:",
        membershipError,
      );

      return jsonError(
        membershipError.message,
        500,
      );
    }

    if (!membership) {
      return jsonError(
        "You are not a member of this workspace.",
        403,
      );
    }

    const role =
      String(membership.role)
        .toLowerCase();

    if (
      role !== "owner" &&
      role !== "admin"
    ) {
      return jsonError(
        "Only workspace owners and admins can delete documents.",
        403,
      );
    }

    const adminSupabase =
      createAdminClient();

    /*
     * Delete the Storage object first.
     * Storage paths must match exactly.
     */
    if (document.file_path) {
      const {
        error: storageError,
      } =
        await adminSupabase.storage
          .from(BUCKET_NAME)
          .remove([
            document.file_path,
          ]);

      if (storageError) {
        console.error(
          "Storage deletion failed:",
          storageError,
        );

        return jsonError(
          storageError.message,
          500,
        );
      }
    }

    /*
     * Delete metadata only after the
     * Storage deletion succeeds.
     */
    const {
      error: metadataError,
    } =
      await adminSupabase
        .from("documents")
        .delete()
        .eq("id", document.id);

    if (metadataError) {
      console.error(
        "Document metadata deletion failed:",
        metadataError,
      );

      return jsonError(
        metadataError.message,
        500,
      );
    }

    return NextResponse.json({
      success: true,
      deletedDocumentId: document.id,
      deletedFilePath:
        document.file_path,
    });
  } catch (error) {
    console.error(
      "Document deletion failed:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not delete document.",
      500,
    );
  }
}