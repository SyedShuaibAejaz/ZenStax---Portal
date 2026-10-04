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


export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      id: documentId,
    } = await context.params;

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
            mime_type
          `,
        )
        .eq("id", documentId)
        .maybeSingle();

    if (documentError) {
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

    const {
      data: membership,
      error: membershipError,
    } =
      await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq(
          "workspace_id",
          document.workspace_id,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      return jsonError(
        "You do not have access to this document.",
        403,
      );
    }

    const adminSupabase =
      createAdminClient();

    const {
      data: signedUrlData,
      error: signedUrlError,
    } =
      await adminSupabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(
          document.file_path,
          600,
          {
            download: document.file_name,
          },
        );

    if (
      signedUrlError ||
      !signedUrlData?.signedUrl
    ) {
      return jsonError(
        signedUrlError?.message ??
          "The document file was not found.",
        404,
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: document.file_name,
      mimeType: document.mime_type,
    });
  } catch (error) {
    console.error(
      "Document download route failed:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not download document.",
      500,
    );
  }
}