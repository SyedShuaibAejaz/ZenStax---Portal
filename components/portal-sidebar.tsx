"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { usePortalShell } from "@/components/portal-shell";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/quotations",
    label: "Quotations",
    icon: FileText,
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: Receipt,
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    adminOnly: true,
  },
];

type PortalSidebarProps = {
  canManageSettings?: boolean;
};

export function PortalSidebar({
  canManageSettings = false,
}: PortalSidebarProps) {
  const pathname = usePathname();

  const {
    collapsed,
    mobileOpen,
    toggleCollapsed,
    setMobileOpen,
  } = usePortalShell();

  const showLabels = !collapsed || mobileOpen;

  function isActiveRoute(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(`${href}/`))
    );
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-zen-navy text-white",
          "transition-[width,transform] duration-300 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          showLabels ? "w-72" : "w-20",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-24 shrink-0 items-center border-b border-zen-blue",
            showLabels ? "justify-start px-5" : "justify-center px-3",
          ].join(" ")}
        >
          <Link
            href="/dashboard"
            aria-label="Open ZenStax dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center"
          >
            <Image
              src="/zenstax-logo.png"
              alt="ZenStax"
              width={865}
              height={822}
              className={[
                "shrink-0 object-contain",
                showLabels ? "h-16 w-20" : "h-11 w-11",
              ].join(" ")}
              priority
            />

            {showLabels && (
              <span className="ml-3 whitespace-nowrap text-xl font-bold">
                Zen<span className="text-zen-orange">Stax</span>
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            title="Close navigation"
            className="ml-auto rounded-lg p-2 text-slate-300 transition hover:bg-zen-surface hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 space-y-2 overflow-hidden p-4"
        >
          {navigationItems
            .filter((item) => !("adminOnly" in item) || canManageSettings)
            .map(({ href, label, icon: Icon }) => {
            const active = isActiveRoute(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={!showLabels ? label : undefined}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex h-12 items-center rounded-xl text-sm",
                  "transition-all duration-200",
                  showLabels
                    ? "justify-start px-4"
                    : "justify-center px-2",
                  active
                    ? "bg-zen-orange font-semibold text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-300 hover:bg-zen-surface hover:text-white",
                ].join(" ")}
              >
                {!showLabels && (
                  <Icon size={20} strokeWidth={2} />
                )}

                {showLabels && (
                  <span className="whitespace-nowrap">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 border-t border-zen-blue p-4 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "group flex h-11 w-full items-center rounded-xl",
              "border border-zen-blue bg-zen-surface",
              "text-slate-300 transition-all duration-200",
              "hover:border-zen-orange hover:bg-zen-orange hover:text-white",
              showLabels
                ? "justify-between px-3"
                : "justify-center px-2",
            ].join(" ")}
          >
            {showLabels && (
              <span className="whitespace-nowrap text-sm font-medium">
                Collapse sidebar
              </span>
            )}

            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-white/20">
              {collapsed ? (
                <ChevronRight size={17} strokeWidth={2.2} />
              ) : (
                <ChevronLeft size={17} strokeWidth={2.2} />
              )}
            </span>
          </button>

          {showLabels && (
            <p className="mt-4 px-1 text-xs leading-5 text-slate-400">
              One clear system for your business.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}