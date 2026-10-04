"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type PortalShellContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
};

const PortalShellContext =
  createContext<PortalShellContextValue | null>(null);

export function usePortalShell() {
  const context = useContext(PortalShellContext);

  if (!context) {
    throw new Error(
      "usePortalShell must be used inside PortalShellProvider",
    );
  }

  return context;
}

export function PortalShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(
      "zenstax-sidebar-collapsed",
    );

    if (storedValue === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((currentValue) => {
      const nextValue = !currentValue;

      window.localStorage.setItem(
        "zenstax-sidebar-collapsed",
        String(nextValue),
      );

      return nextValue;
    });
  }

  return (
    <PortalShellContext.Provider
      value={{
        collapsed,
        mobileOpen,
        toggleCollapsed,
        setMobileOpen,
      }}
    >
      {children}
    </PortalShellContext.Provider>
  );
}