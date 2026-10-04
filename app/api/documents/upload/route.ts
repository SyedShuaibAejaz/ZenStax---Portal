import { NextResponse } from "next/server";
import {
  createClient as createSupabaseAdminClient,
} from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";



const BUCKET_NAME =
  "workspace-documents";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

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
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Missing Supabase admin environment variables.",
    );
  }

  return createSupabaseAdminClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function sanitizeFileName(
  fileName: string,
) {
  const normalized =
    fileName.normalize("NFKD");

  const safeName =
    normalized
      .replace(/[^\w.\- ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 180);

  return safeName || "file";
}

function getExtension(
  fileName: string,
) {
  const lastDot =
    fileName.lastIndexOf(".");

  if (
    lastDot === -1 ||
    lastDot === fileName.length - 1
  ) {
    return "file";
  }

  const extension =
    fileName
      .slice(lastDot + 1)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return extension.slice(0, 12) || "file";
}

export async function POST(
  request: Request,
) {
  let uploadedFilePath:
    | string
    | null = null;

  try {
    /*
     * Authenticate using the user's
     * server-side Supabase client.
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
     * Read multipart form data.
     */
    const formData =
      await request.formData();

    const workspaceId =
      String(
        formData.get("workspaceId") ?? "",
      ).trim();

    const title =
      String(
        formData.get("title") ?? "",
      ).trim();

    const description =
      String(
        formData.get("description") ?? "",
      ).trim();

    const category =
      String(
        formData.get("category") ??
          "Other",
      ).trim();

    const file =
      formData.get("file");

    /*
     * Validate fields.
     */
    if (!isUuid(workspaceId)) {
      return jsonError(
        "A valid workspace ID is required.",
        400,
      );
    }

    if (!title) {
      return jsonError(
        "Document title is required.",
        400,
      );
    }

    if (title.length > 200) {
      return jsonError(
        "Document title must be 200 characters or fewer.",
        400,
      );
    }

    if (description.length > 2000) {
      return jsonError(
        "Description must be 2,000 characters or fewer.",
        400,
      );
    }

    if (!(file instanceof File)) {
      return jsonError(
        "Please select a file.",
        400,
      );
    }

    if (file.size <= 0) {
      return jsonError(
        "The selected file is empty.",
        400,
      );
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      return jsonError(
        "Files must be smaller than 10 MB.",
        400,
      );
    }

    if (
      !ALLOWED_MIME_TYPES.has(
        file.type,
      )
    ) {
      return jsonError(
        "This file type is not supported.",
        400,
      );
    }

    /*
     * Verify workspace membership
     * using the authenticated client.
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
          workspaceId,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Workspace membership lookup failed:",
        membershipError,
      );

      return jsonError(
        "Could not verify workspace access.",
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
      role !== "admin" &&
      role !== "finance"
    ) {
      return jsonError(
        "You do not have permission to upload documents.",
        403,
      );
    }

    /*
     * Create the admin client only
     * after authentication and permission
     * checks have passed.
     */
    const adminSupabase =
      createAdminClient();

    const documentId =
      crypto.randomUUID();

    const extension =
      getExtension(file.name);

    const storedFileName =
      `${documentId}.${extension}`;

    const originalFileName =
      sanitizeFileName(file.name);

    /*
     * Required path format:
     *
     * workspaceId/documentId/documentId.ext
     */
    const filePath =
      `${workspaceId}/${documentId}/${storedFileName}`;

    uploadedFilePath = filePath;

    const fileBuffer =
      Buffer.from(
        await file.arrayBuffer(),
      );

    /*
     * Upload to the private bucket.
     */
    const {
      error: uploadError,
    } =
      await adminSupabase.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          fileBuffer,
          {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          },
        );

    if (uploadError) {
      console.error(
        "Storage upload failed:",
        uploadError,
      );

      return jsonError(
        uploadError.message,
        500,
      );
    }

    /*
     * Insert document metadata.
     */
    const {
      data: document,
      error: documentError,
    } =
      await adminSupabase
        .from("documents")
        .insert({
          id: documentId,
          workspace_id: workspaceId,
          uploaded_by: user.id,
          title,
          description:
            description || null,
          category:
            category || "Other",
          file_name:
            originalFileName,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
        })
        .select(
          `
            id,
            workspace_id,
            uploaded_by,
            title,
            description,
            category,
            file_name,
            file_path,
            mime_type,
            file_size,
            created_at
          `,
        )
        .single();

    if (documentError) {
      console.error(
        "Document metadata insert failed:",
        documentError,
      );

      /*
       * Remove the Storage object if
       * metadata insertion fails.
       */
      await adminSupabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      uploadedFilePath = null;

      return jsonError(
        documentError.message,
        500,
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          ...document,
          file_size: Number(
            document.file_size,
          ),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Document upload route failed:",
      error,
    );

    /*
     * Last-resort cleanup.
     */
    if (uploadedFilePath) {
      try {
        const adminSupabase =
          createAdminClient();

        await adminSupabase.storage
          .from(BUCKET_NAME)
          .remove([
            uploadedFilePath,
          ]);
      } catch (cleanupError) {
        console.error(
          "Storage cleanup failed:",
          cleanupError,
        );
      }
    }

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not upload document.",
      500,
    );
  }
}