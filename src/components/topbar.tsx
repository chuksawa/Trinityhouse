"use client";

import Link from "next/link";
import { Bell, Search, Home, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type NotificationItem = { id: string; title: string; body: string; read: boolean; createdAt: string };

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          title="Back to public site"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search people, groups, events…"
              className="w-72 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-200"
          >
            <Search className="h-4 w-4" />
            <span>Search…</span>
            <kbd className="ml-8 hidden rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Manage notification preferences
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            DO
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              Pastor David
            </p>
            <p className="text-xs text-gray-500">Senior Pastor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
