"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Home, Settings, CalendarDays, PanelTop, PanelLeft, Shield, Church, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLayoutMode } from "@/contexts/layout-mode-context";
import { dashboardNavItems, dashboardBottomItems } from "@/lib/dashboard-nav";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DEFAULT_USER_NAV = ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"];

type NotificationItem = { id: string; title: string; body: string; read: boolean; createdAt: string };
type SessionUser = { email?: string; role?: string } | null;

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
}

function initialsFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? email).replace(/[^a-zA-Z0-9]/g, "");
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return (local || "?").slice(0, 2).toUpperCase();
}

function formatRole(role: string): string {
  if (role === "superuser") return "Superuser";
  if (role === "admin") return "Admin";
  return "User";
}

type TopbarProps = {
  onOpenMobileMenu?: () => void;
  isMobile?: boolean;
};

export default function Topbar({ onOpenMobileMenu, isMobile }: TopbarProps = {}) {
  const pathname = usePathname();
  const { layoutMode, toggleLayoutMode } = useLayoutMode();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [user, setUser] = useState<SessionUser>(null);
  const [navVisibility, setNavVisibility] = useState<Record<string, string[]>>({});
  const bellRef = useRef<HTMLDivElement>(null);

  const allowedHrefs =
    user?.role && navVisibility[user.role] !== undefined
      ? navVisibility[user.role]
      : user?.role === "user"
        ? DEFAULT_USER_NAV
        : null;
  const visibleNavItems =
    allowedHrefs === null
      ? dashboardNavItems
      : dashboardNavItems.filter((item) => allowedHrefs.includes(item.href));
  const visibleBottomItems =
    allowedHrefs === null
      ? dashboardBottomItems
      : dashboardBottomItems.filter((item) => allowedHrefs.includes(item.href));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { user: null })),
      fetch(`${BASE_PATH}/api/settings/nav-visibility`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { navVisibility: {} })),
    ])
      .then(([session, config]) => {
        if (!cancelled) {
          setUser(session.user ?? null);
          setNavVisibility(config.navVisibility ?? {});
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/notifications/`, { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.notifications)) setNotifications(data.notifications);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    })();
    return () => { cancelled = true; };
  }, [bellOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    if (bellOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [bellOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isTopbarMode = layoutMode === "topbar";
  const dark = isTopbarMode;
  const topbarLabel = (label: string) => label.split(/\s+/)[0];

  if (isMobile && onOpenMobileMenu) {
    return (
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-white/80 px-4 backdrop-blur-sm md:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link
          href="/home"
          className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Church className="h-4 w-4" />
          </div>
          <span className="truncate text-sm font-bold text-gray-900">Trinity House</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setBellOpen((o) => !o)}
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                </div>
                <div className="max-h-48 overflow-y-auto px-4 py-3 text-sm text-gray-500">
                  {notifications.length === 0 ? (
                    "You're all caught up"
                  ) : (
                    <ul className="space-y-2">
                      {notifications.map((n) => (
                        <li key={n.id} className={n.read ? "text-gray-500" : "font-medium text-gray-900"}>
                          <p>{n.title}</p>
                          {n.body && <p className="text-xs text-gray-400">{n.body}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link
                  href="/dashboard/settings/notifications"
                  onClick={() => setBellOpen(false)}
                  className="flex gap-2 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Manage notification preferences
                </Link>
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {user?.email ? initialsFromEmail(user.email) : "—"}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-20 items-center justify-between gap-4 px-6 transition-colors",
        dark ? "bg-slate-900" : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide sm:gap-2">
        {isTopbarMode ? (
          <>
            <Link
              href="/home"
              className="mr-2 flex shrink-0 items-center gap-2.5 border-r border-gray-700 pr-4 transition-colors hover:opacity-90"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Church className="h-5 w-5" />
              </div>
              <div className="hidden overflow-hidden sm:block">
                <p className="text-sm font-bold leading-tight text-white">Trinity House</p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-brand-300">Church Hub</p>
              </div>
            </Link>
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                    dark
                      ? isActive
                        ? "bg-brand-600/30 text-brand-300"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                      : isActive
                        ? "bg-brand-100 text-brand-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">{topbarLabel(item.label)}</span>
                </Link>
              );
            })}
            {visibleBottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                    dark
                      ? isActive
                        ? "bg-brand-600/30 text-brand-300"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                      : isActive
                        ? "bg-brand-100 text-brand-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">{topbarLabel(item.label)}</span>
                </Link>
              );
            })}
            {user?.role === "superuser" && (
              <Link
                href="/dashboard/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                  dark
                    ? pathname?.startsWith("/dashboard/admin")
                      ? "bg-brand-600/30 text-brand-300"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                    : pathname?.startsWith("/dashboard/admin")
                      ? "bg-brand-100 text-brand-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/home"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Back to public site"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Public events"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </Link>
          </>
        )}
        {searchOpen ? (
          <div className={cn("flex items-center gap-2", dark && "text-gray-300")}>
            <Search className="h-4 w-4 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search people, groups, events…"
              className={cn(
                "w-72 border-none bg-transparent text-sm outline-none",
                dark
                  ? "placeholder:text-gray-500 text-white"
                  : "placeholder:text-gray-400 text-gray-900"
              )}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search people, groups, events"
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors",
              dark
                ? "text-gray-400 hover:bg-white/10 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleLayoutMode}
          className={cn(
            "rounded-lg p-2 transition-colors",
            dark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          )}
          title={isTopbarMode ? "Switch to side bar navigation" : "Switch to top bar navigation"}
        >
          {isTopbarMode ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelTop className="h-5 w-5" />
          )}
        </button>
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className={cn(
              "relative rounded-lg p-2 transition-colors",
              dark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
              </div>
              <div className="max-h-48 overflow-y-auto px-4 py-3 text-sm text-gray-500">
                {notifications.length === 0 ? (
                  "You're all caught up"
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((n) => (
                      <li key={n.id} className={n.read ? "text-gray-500" : "font-medium text-gray-900"}>
                        <p>{n.title}</p>
                        {n.body && <p className="text-xs text-gray-400">{n.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Link
                href="/dashboard/settings/notifications"
                onClick={() => setBellOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Manage notification preferences
              </Link>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
            dark ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {user?.email ? initialsFromEmail(user.email) : "—"}
          </div>
          <div className="hidden sm:block">
            <p className={cn("text-sm font-semibold", dark ? "text-gray-200" : "text-gray-800")}>
              {user?.email ? displayNameFromEmail(user.email) : "—"}
            </p>
            <p className={cn("text-xs", dark ? "text-gray-500" : "text-gray-500")}>
              {user?.role ? formatRole(user.role) : "—"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
