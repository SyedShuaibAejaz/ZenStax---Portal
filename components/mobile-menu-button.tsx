"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("portal-menu-open"))}
      className="inline-flex size-11 items-center justify-center rounded-xl text-foreground transition hover:bg-accent active:scale-95 lg:hidden"
      aria-label="Open navigation menu"
      aria-controls="portal-navigation"
    >
      <Menu className="size-6" aria-hidden="true" />
    </button>
  );
}
