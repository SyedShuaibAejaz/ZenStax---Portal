"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/settings", label: "Company" },
  { href: "/settings/members", label: "Members" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl gap-2 border-b border-border">
      {tabs.map((tab) => {
        const active =
          tab.href === "/settings"
            ? pathname === "/settings" || pathname === "/settings/company"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-zen-orange text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
