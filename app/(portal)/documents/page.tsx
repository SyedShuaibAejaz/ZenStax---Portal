import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DocumentsPageClient from "@/components/documents/DocumentsPageClient";

export const instant = false;

export type DocumentItem = {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export default async function DocumentsPage() {
  const supabase =
    await createClient();

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !authData.user
  ) {
    redirect("/login");
  }

  const user = authData.user;

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
    return (
      <main className="rounded-xl p-4 sm:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Your account is not assigned to
          a workspace.
        </div>
      </main>
    );
  }

  const workspaceId =
    membership.workspace_id;

  const role =
    String(membership.role)
      .toLowerCase();

  const {
    data: documentsData,
    error: documentsError,
  } =
    await supabase
      .from("documents")
      .select(
        `
          id,
          workspace_id,
          uploaded_by,
          title,
          description,
          category,
          file_name,
          mime_type,
          file_size,
          created_at
        `,
      )
      .eq(
        "workspace_id",
        workspaceId,
      )
      .order("created_at", {
        ascending: false,
      });

  if (documentsError) {
    console.error(
      "Documents load failed:",
      documentsError,
    );
  }

  const documents: DocumentItem[] =
    Array.isArray(documentsData)
      ? documentsData.map(
          (document) => ({
            id: document.id,
            workspace_id:
              document.workspace_id,
            uploaded_by:
              document.uploaded_by,
            title: document.title,
            description:
              document.description,
            category: document.category,
            file_name: document.file_name,
            mime_type: document.mime_type,
            file_size: Number(
              document.file_size,
            ),
            created_at: document.created_at,
          }),
        )
      : [];

  const canUpload =
    role === "owner" ||
    role === "admin" ||
    role === "finance";

  const canManage =
    role === "owner" ||
    role === "admin";

  return (
    <main className="min-w-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zen-orange">
            Workspace files
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Documents
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Store and manage invoices,
            receipts, contracts, and other
            business files.
          </p>
        </div>

        <DocumentsPageClient
          workspaceId={workspaceId}
          initialDocuments={documents}
          role={role}
          canUpload={canUpload}
          canManage={canManage}
        />
      </div>
    </main>
  );
}