import { createClient } from "@/lib/supabase/server";

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "finance"
  | "member"
  | "viewer";

export type CurrentWorkspace = {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
};

/**
 * Returns the signed-in user's workspace.
 * Uses the oldest membership, so the result is always the same workspace.
 */
export async function getCurrentWorkspace(): Promise<CurrentWorkspace | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    return null;
  }

  return {
    userId: user.id,
    workspaceId: membership.workspace_id as string,
    role: membership.role as WorkspaceRole,
  };
}

export function canEditSettings(role: WorkspaceRole) {
  return role === "owner" || role === "admin";
}