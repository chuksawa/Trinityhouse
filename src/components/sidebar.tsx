"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Church,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelTop,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLayoutMode } from "@/contexts/layout-mode-context";
import { dashboardNavItems, dashboardBottomItems } from "@/lib/dashboard-nav";

const navItems = dashboardNavItems;
const bottomItems = dashboardBottomItems;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const DEFAULT_USER_NAV = ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"];

type SidebarProps = {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
};

export default function Sidebar({ isMobile, open = false, onClose, onNavigate }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [navVisibility, setNavVisibility] = useState<Record<string, string[]>>({});

  const allowedHrefs =
    userRole && navVisibility[userRole] !== undefined
      ? navVisibility[userRole]
      : userRole === "user"
        ? DEFAULT_USER_NAV
        : null;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { user: null })),
      fetch(`${BASE_PATH}/api/settings/nav-visibility`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { navVisibility: {} })),
    ])
      .then(([session, config]) => {
        if (!cancelled) {
          setUserRole(session.user?.role ?? null);
          setNavVisibility(config.navVisibility ?? {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const visibleNavItems = allowedHrefs === null ? navItems : navItems.filter((item) => allowedHrefs.includes(item.href));
  const visibleBottomItems = allowedHrefs === null ? bottomItems : bottomItems.filter((item) => allowedHrefs.includes(item.href));

  const { layoutMode, setLayoutMode } = useLayoutMode();
  if (!isMobile && layoutMode === "topbar") return null;

  async function handleSignOut() {
    await fetch(`${BASE_PATH}/api/auth/logout/`, { method: "POST", credentials: "include" });
    router.push(`${BASE_PATH}/login/`);
    router.refresh();
  }

  const handleNavClick = () => {
    onNavigate?.();
  };

  const panel = (
    <>
      {/* Logo — same height as topbar (h-20) so the divider lines up */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-800 px-4">
        <Link
          href="/home"
          className="flex items-center gap-3 transition-colors hover:bg-white/5 rounded-lg -m-2 p-2"
          onClick={handleNavClick}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Church className="h-5 w-5" />
          </div>
          {(!isMobile || !collapsed) && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-white tracking-tight">
                Trinity House
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-300">
                Church Hub
              </p>
            </div>
          )}
        </Link>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600/20 text-brand-300"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(!isMobile || !collapsed) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        {isSuperuser && (
          <Link
            href="/dashboard/admin"
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin")
                ? "bg-brand-600/20 text-brand-300"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Shield className="h-5 w-5 shrink-0" />
            {(!isMobile || !collapsed) && <span>Admin</span>}
          </Link>
        )}
        {visibleBottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-brand-600/20 text-brand-300"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {(!isMobile || !collapsed) && <span>{item.label}</span>}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!isMobile || !collapsed) && <span>Sign Out</span>}
        </button>

        {!isMobile && (
          <>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("topbar")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
              title="Switch to top bar navigation"
            >
              <PanelTop className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Top bar</span>}
            </button>
          </>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          className={cn(
            "fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 md:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={onClose}
          tabIndex={open ? 0 : -1}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-800 bg-slate-900 transition-transform duration-300 ease-out md:hidden",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {panel}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-800 bg-slate-900 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {panel}
    </aside>
  );
}
