import Link from "next/link";

import { MembersManager } from "@/components/settings/members-manager";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type MemberRole =
  | "owner"
  | "admin"
  | "finance"
  | "member"
  | "viewer";

type MemberRow = {
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type PermissionRow = {
  permission_key: string;
};

const availablePermissions = [
  "company.view",
  "company.manage",
  "members.view",
  "members.manage",
  "quotations.view",
  "quotations.create",
  "quotations.edit",
  "quotations.delete",
  "quotations.convert",
  "invoices.view",
  "invoices.create",
  "invoices.edit",
  "invoices.delete",
  "invoices.cancel",
  "payments.view",
  "payments.create",
  "payments.edit",
  "payments.delete",
  "documents.view",
  "documents.upload",
  "documents.delete",
  "reports.view",
];

export default async function MembersSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        Please sign in again.
      </section>
    );
  }

  const { data: currentMembership, error: membershipError } =
    await supabase
      .from("workspace_members")
      .select("workspace_id, user_id, role, created_at")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

  if (membershipError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load your workspace membership
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {membershipError.message}
        </p>
      </section>
    );
  }

  if (!currentMembership) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Workspace settings
            </p>

            <h1 className="mt-1 text-3xl font-semibold">
              Workspace members
            </h1>
          </div>

          <Link
            href="/settings"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            ← Back to settings
          </Link>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          No workspace membership was found.
        </div>
      </section>
    );
  }

  const { data: memberRows, error: membersError } =
    await supabase
      .from("workspace_members")
      .select("workspace_id, user_id, role, created_at")
      .eq(
        "workspace_id",
        currentMembership.workspace_id,
      )
      .order("created_at", { ascending: true });

  if (membersError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load workspace members
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {membersError.message}
        </p>
      </section>
    );
  }

  const typedMemberRows =
    (memberRows ?? []) as MemberRow[];

  const userIds = typedMemberRows.map(
    (member) => member.user_id,
  );

  let profiles: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    profiles = (profileRows ?? []) as ProfileRow[];
  }

  const { data: permissionRows } = await supabase
    .from("member_permissions")
    .select("user_id, permission_key")
    .eq(
      "workspace_id",
      currentMembership.workspace_id,
    );

  const typedPermissionRows =
    (permissionRows ?? []) as {
      user_id: string;
      permission_key: string;
    }[];

  const members = typedMemberRows.map((member) => {
    const profile = profiles.find(
      (item) => item.id === member.user_id,
    );

    return {
      workspace_id: member.workspace_id,
      user_id: member.user_id,
      role: member.role,
      created_at: member.created_at,
      email: profile?.email ?? null,
      full_name: profile?.full_name ?? null,
      permissions: typedPermissionRows
        .filter(
          (permission) =>
            permission.user_id === member.user_id,
        )
        .map(
          (permission) => permission.permission_key,
        ),
    };
  });

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Workspace settings
          </p>

          <h1 className="mt-1 text-3xl font-semibold">
            Workspace members
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Add members, manage roles, and control permissions.
          </p>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Back to settings
        </Link>
      </div>

      <MembersManager
        workspaceId={currentMembership.workspace_id}
        currentUserId={user.id}
        currentUserRole={
          currentMembership.role as MemberRole
        }
        initialMembers={members}
        availablePermissions={availablePermissions}
      />
    </section>
  );
}