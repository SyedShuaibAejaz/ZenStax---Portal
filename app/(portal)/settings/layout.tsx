import { redirect } from "next/navigation";

import { SettingsTabs } from "@/components/settings/settings-tabs";
import {
  canEditSettings,
  getCurrentWorkspace,
} from "@/lib/workspace/get-current-workspace";

export const instant = false;

/**
 * Every page under /settings is owner/admin only.
 * The database enforces the same rule, this keeps others out of the UI.
 */
export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  if (!canEditSettings(workspace.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <SettingsTabs />
      {children}
    </div>
  );
}
