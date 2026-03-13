"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Church } from "lucide-react";
import { useState, useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type SessionUser = { sub?: string; email?: string; name?: string } | null;

export default function PublicHeader() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(undefined as unknown as SessionUser);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    await fetch(`${BASE_PATH}/api/auth/logout/`, { method: "POST", credentials: "include" });
    setUser(null);
    setLoggingOut(false);
    router.refresh();
  }

  const isAuthenticated = user !== undefined && user !== null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Church className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900">Trinity House</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/home"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/home#visit"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Visit
          </Link>
          <Link
            href="/events"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Events
          </Link>
          <Link
            href="/home#watch"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Watch
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="btn-primary text-sm"
              >
                {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
