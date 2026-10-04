export const instant = false;

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BrandingSettingsForm from "@/components/settings/branding-settings-form";

type WorkspaceBranding = {
  id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

type Membership = {
  workspace_id: string;
  role: string;
};

export default async function BrandingSettingsPage() {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: membership,
    error: membershipError,
  } =
    await supabase
      .from("workspace_members")
      .select("workspace_id, role")
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
      <main className="min-h-screen bg-[#F6F8FB] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-lg font-semibold">
              Workspace not found
            </h1>

            <p className="mt-2 text-sm">
              Your account is not assigned to a workspace.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const workspaceId =
    membership.workspace_id;

  const currentRole =
    String(membership.role).toLowerCase();

  const canEdit =
    currentRole === "owner" ||
    currentRole === "admin";

  const {
    data: workspace,
    error: workspaceError,
  } =
    await supabase
      .from("workspaces")
      .select(
        "id, logo_url, primary_color, secondary_color",
      )
      .eq("id", workspaceId)
      .single();

  if (
    workspaceError ||
    !workspace
  ) {
    console.error(
      "Branding workspace load failed:",
      workspaceError,
    );

    return (
      <main className="min-h-screen bg-[#F6F8FB] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-lg font-semibold">
              Branding could not be loaded
            </h1>

            <p className="mt-2 text-sm">
              Check that the branding columns exist in
              the workspaces table.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const branding =
    workspace as WorkspaceBranding;

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
            Workspace settings
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#071B31]">
            Branding
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Customize your company logo and workspace
            colors.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <BrandingSettingsForm
            workspaceId={workspaceId}
            logoUrl={branding.logo_url}
            primaryColor={
              branding.primary_color ??
              "#FF7425"
            }
            secondaryColor={
              branding.secondary_color ??
              "#071B31"
            }
            role={currentRole}
            canEdit={canEdit}
          />

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#071B31]">
                Your access
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071B31] text-lg font-semibold uppercase text-white">
                  {currentRole.charAt(0)}
                </div>

                <div>
                  <p className="font-semibold capitalize text-[#071B31]">
                    {currentRole}
                  </p>

                  <p className="text-sm text-slate-500">
                    Workspace role
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <PermissionRow
                  label="View branding"
                  allowed
                />

                <PermissionRow
                  label="Upload logo"
                  allowed={canEdit}
                />

                <PermissionRow
                  label="Change colors"
                  allowed={canEdit}
                />

                <PermissionRow
                  label="Delete branding"
                  allowed={currentRole === "owner"}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[#FFD8C5] bg-[#FFF7F2] p-6">
              <h2 className="text-sm font-semibold text-[#9A431D]">
                Branding permissions
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#9A431D]/80">
                Only workspace owners and administrators
                can change the company logo and colors.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PermissionRow({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-600">
        {label}
      </span>

      <span
        className={[
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          allowed
            ? "bg-green-50 text-green-700"
            : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        {allowed ? "Allowed" : "Restricted"}
      </span>
    </div>
  );
}