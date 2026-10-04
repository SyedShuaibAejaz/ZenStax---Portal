"use client";

import { Menu } from "lucide-react";

import { usePortalShell } from "@/components/portal-shell";

export function MobileMenuButton() {
  const { setMobileOpen } = usePortalShell();

  return (
    <button
      type="button"
      aria-label="Open navigation"
      title="Open navigation"
      className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Menu size={22} strokeWidth={2} />
    </button>
  );
}