import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CompanySettingsForm from "@/components/settings/company-settings-form";

type Workspace = {
  id: string;
  name: string | null;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Membership = {
  role: string;
};

export default async function CompanySettingsPage() {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Replace this with your actual workspace lookup
   * if the active workspace is stored elsewhere.
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
    !membership
  ) {
    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            You are not assigned to a workspace.
          </div>
        </div>
      </main>
    );
  }

  const workspaceId =
    membership.workspace_id;

  const {
    data: workspace,
    error: workspaceError,
  } =
    await supabase
      .from("workspaces")
      .select(
        "id, name, legal_name, phone, email, address, created_at, updated_at",
      )
      .eq("id", workspaceId)
      .single();

  if (
    workspaceError ||
    !workspace
  ) {
    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Company settings could not be loaded.
          </div>
        </div>
      </main>
    );
  }

  const currentRole =
    String(membership.role).toLowerCase();

  const canEdit =
    currentRole === "owner" ||
    currentRole === "admin";

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
            Workspace settings
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#071B31]">
            Company settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the company information used across
            your ZenStax business portal.
          </p>
        </div>

        <CompanySettingsForm
          workspace={workspace as Workspace}
          workspaceId={workspaceId}
          role={currentRole}
          canEdit={canEdit}
        />
      </div>
    </main>
  );
}