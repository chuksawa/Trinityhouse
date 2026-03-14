"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { SiteFooterMinimal } from "@/components/site-footer";
import { LayoutModeProvider, useLayoutMode } from "@/contexts/layout-mode-context";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { layoutMode } = useLayoutMode();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const useSidebarDesktop = !isMobile && layoutMode === "sidebar";
  const useSidebarMobile = isMobile;

  return (
    <div className="flex min-h-screen">
      {useSidebarMobile && (
        <Sidebar
          isMobile
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      )}
      {useSidebarDesktop && <Sidebar />}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          useSidebarDesktop ? "pl-64" : "pl-0"
        )}
      >
        <Topbar
          onOpenMobileMenu={useSidebarMobile ? () => setMobileMenuOpen(true) : undefined}
          isMobile={isMobile}
        />
        <main className="flex-1 p-6">{children}</main>
        <SiteFooterMinimal />
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
