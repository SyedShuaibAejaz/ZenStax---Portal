"use client";

import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MemberRole =
  | "owner"
  | "admin"
  | "finance"
  | "member"
  | "viewer";

type Member = {
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  email: string | null;
  full_name: string | null;
  permissions: string[];
};

type MembersManagerProps = {
  workspaceId: string;
  currentUserId: string;
  currentUserRole: MemberRole;
  initialMembers: Member[];
  availablePermissions: string[];
};

const roleOptions: {
  value: MemberRole;
  label: string;
}[] = [
  { value: "admin", label: "Admin" },
  { value: "finance", label: "Finance" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

const permissionLabels: Record<string, string> = {
  "company.view": "View company settings",
  "company.manage": "Manage company settings",
  "members.view": "View members",
  "members.manage": "Manage members",
  "quotations.view": "View quotations",
  "quotations.create": "Create quotations",
  "quotations.edit": "Edit quotations",
  "quotations.delete": "Delete quotations",
  "quotations.convert": "Convert quotations",
  "invoices.view": "View invoices",
  "invoices.create": "Create invoices",
  "invoices.edit": "Edit invoices",
  "invoices.delete": "Delete invoices",
  "invoices.cancel": "Cancel invoices",
  "payments.view": "View payments",
  "payments.create": "Create payments",
  "payments.edit": "Edit payments",
  "payments.delete": "Delete payments",
  "documents.view": "View documents",
  "documents.upload": "Upload documents",
  "documents.delete": "Delete documents",
  "reports.view": "View reports",
};

export function MembersManager({
  workspaceId,
  currentUserId,
  currentUserRole,
  initialMembers,
  availablePermissions,
}: MembersManagerProps) {
  const supabase = createClient();

  const [members, setMembers] =
    useState<Member[]>(initialMembers);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");

  const [selectedMemberId, setSelectedMemberId] =
    useState<string | null>(null);

  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>([]);

  const [isInviting, setIsInviting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    null,
  );

  const canManage =
    currentUserRole === "owner" ||
    currentUserRole === "admin";

  const selectedMember = useMemo(
    () =>
      members.find(
        (member) => member.user_id === selectedMemberId,
      ) ?? null,
    [members, selectedMemberId],
  );

  function selectMember(member: Member) {
    setSelectedMemberId(member.user_id);
    setSelectedPermissions(member.permissions);
    setError(null);
    setMessage(null);
  }

  function togglePermission(permission: string) {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }

  async function inviteMember(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canManage) {
      setError("You do not have permission to invite members.");
      return;
    }

    setIsInviting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/workspace/members/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId,
            email,
            role,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not invite member.",
        );
      }

      setEmail("");
      setRole("member");
      setMessage(
        `Invitation sent to ${result.email}.`,
      );
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not invite member.",
      );
    } finally {
      setIsInviting(false);
    }
  }

  async function updateRole(
    member: Member,
    nextRole: MemberRole,
  ) {
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const { data, error: updateError } =
      await supabase.rpc(
        "update_workspace_member_role",
        {
          p_workspace_id: workspaceId,
          p_user_id: member.user_id,
          p_role: nextRole,
        },
      );

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setMembers((current) =>
      current.map((item) =>
        item.user_id === member.user_id
          ? { ...item, role: nextRole }
          : item,
      ),
    );

    setMessage("Member role updated.");
    setIsSaving(false);
  }

  async function savePermissions() {
    if (!selectedMember || !canManage) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const { data, error: permissionError } =
      await supabase.rpc(
        "replace_member_permissions",
        {
          p_workspace_id: workspaceId,
          p_user_id: selectedMember.user_id,
          p_permissions: selectedPermissions,
        },
      );

    if (permissionError) {
      setError(permissionError.message);
      setIsSaving(false);
      return;
    }

    const savedPermissions = (data ?? []).map(
      (item: { permission_key: string }) =>
        item.permission_key,
    );

    setMembers((current) =>
      current.map((member) =>
        member.user_id === selectedMember.user_id
          ? {
              ...member,
              permissions: savedPermissions,
            }
          : member,
      ),
    );

    setMessage("Permissions saved.");
    setIsSaving(false);
  }

  async function removeMember(member: Member) {
    if (!canManage) {
      return;
    }

    if (member.user_id === currentUserId) {
      setError("You cannot remove yourself.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.email ?? "this member"} from the workspace?`,
    );

    if (!confirmed) {
      return;
    }

    setIsRemoving(true);
    setError(null);
    setMessage(null);

    const { error: removeError } = await supabase.rpc(
      "remove_workspace_member",
      {
        p_workspace_id: workspaceId,
        p_user_id: member.user_id,
      },
    );

    if (removeError) {
      setError(removeError.message);
      setIsRemoving(false);
      return;
    }

    setMembers((current) =>
      current.filter(
        (item) => item.user_id !== member.user_id,
      ),
    );

    if (selectedMemberId === member.user_id) {
      setSelectedMemberId(null);
      setSelectedPermissions([]);
    }

    setMessage("Member removed.");
    setIsRemoving(false);
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={inviteMember}
          className="rounded-2xl border border-border bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            Add workspace member
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Send an invitation and choose the initial role.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <div className="grid gap-2">
              <Label htmlFor="member-email">
                Email address
              </Label>

              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="partner@example.com"
                required
                disabled={isInviting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-role">
                Initial role
              </Label>

              <select
                id="member-role"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as MemberRole,
                  )
                }
                disabled={isInviting}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm"
              >
                {roleOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isInviting}
              className="bg-zen-orange text-white hover:bg-orange-600"
            >
              {isInviting ? "Inviting..." : "Invite member"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-border bg-slate-50">
              <tr>
                <th className="px-5 py-4">
                  Member
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Added
                </th>

                {canManage && (
                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => {
                const isCurrentUser =
                  member.user_id === currentUserId;

                return (
                  <tr
                    key={member.user_id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {member.full_name ||
                          member.email ||
                          "Unnamed member"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {member.email ?? "Email unavailable"}
                      </p>

                      {isCurrentUser && (
                        <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          You
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {canManage && !isCurrentUser ? (
                        <select
                          value={member.role}
                          onChange={(event) =>
                            updateRole(
                              member,
                              event.target.value as MemberRole,
                            )
                          }
                          disabled={isSaving}
                          className="h-9 rounded-md border border-input bg-white px-2 text-sm capitalize"
                        >
                          {roleOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {member.role}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {new Intl.DateTimeFormat("en-AE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(member.created_at))}
                    </td>

                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              selectMember(member)
                            }
                          >
                            Permissions
                          </Button>

                          {!isCurrentUser && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                removeMember(member)
                              }
                              disabled={isRemoving}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {canManage && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Member permissions
            </h2>

            {!selectedMember ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Select a member to manage their permissions.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="font-medium">
                    {selectedMember.full_name ||
                      selectedMember.email ||
                      "Selected member"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedMember.email}
                  </p>
                </div>

                <div className="mt-5 max-h-[480px] space-y-3 overflow-y-auto pr-2">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(
                          permission,
                        )}
                        onChange={() =>
                          togglePermission(permission)
                        }
                        className="mt-1 h-4 w-4 accent-orange-500"
                      />

                      <span className="text-sm">
                        {permissionLabels[permission] ??
                          permission}
                      </span>
                    </label>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={savePermissions}
                  disabled={isSaving}
                  className="mt-5 w-full bg-zen-orange text-white hover:bg-orange-600"
                >
                  {isSaving
                    ? "Saving..."
                    : "Save permissions"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}
    </div>
  );
}