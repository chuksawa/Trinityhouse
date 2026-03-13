"use client";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { LayoutModeProvider, useLayoutMode } from "@/contexts/layout-mode-context";
import { cn } from "@/lib/utils";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { layoutMode } = useLayoutMode();
  const useSidebar = layoutMode === "sidebar";

  return (
    <div className="flex min-h-screen">
      {useSidebar && <Sidebar />}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          useSidebar ? "pl-64" : "pl-0"
        )}
      >
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutModeProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </LayoutModeProvider>
  );
}
