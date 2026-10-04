import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { PortalShellProvider } from "@/components/portal-shell";
import { PortalSidebar } from "@/components/portal-sidebar";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <PortalShellProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <PortalSidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-30 flex h-24 shrink-0 items-center justify-between border-b border-border bg-white px-5 lg:px-8">
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