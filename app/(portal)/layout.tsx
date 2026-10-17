import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { PortalShellProvider } from "@/components/portal-shell";
import { PortalSidebar } from "@/components/portal-sidebar";
import { createClient } from "@/lib/supabase/server";
import {
  canEditSettings,
  getCurrentWorkspace,
} from "@/lib/workspace/get-current-workspace";

export const instant = false;

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getCurrentWorkspace();
  const canManageSettings = workspace
    ? canEditSettings(workspace.role)
    : false;

  return (
    <PortalShellProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <PortalSidebar canManageSettings={canManageSettings} />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:h-20 sm:px-5 lg:h-24 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileMenuButton />

              <div>
                <p className="text-sm text-muted-foreground">
                  ZenStax workspace
                </p>

                <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
                  Business Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden max-w-[240px] truncate text-sm text-muted-foreground sm:block">
                {user.email}
              </p>

              <LogoutButton />
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-5 lg:p-8">{children}</div>
          </div>
        </main>
      </div>
    </PortalShellProvider>
  );
}