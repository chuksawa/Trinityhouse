"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DEFAULT_USER_NAV = ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"];

/** Redirects non-admin users to /dashboard if they hit a path not in their allowed nav. */
export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { user: null })),
      fetch(`${BASE_PATH}/api/settings/nav-visibility`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { navVisibility: {} })),
    ])
      .then(([session, config]) => {
        if (cancelled) return;
        const role = session.user?.role as string | undefined;
        const isAdmin = role === "superuser" || role === "admin";
        if (isAdmin) {
          setReady(true);
          return;
        }
        const allowed = (role && config.navVisibility?.[role]) ?? DEFAULT_USER_NAV;
        const path = pathname?.replace(new RegExp(`^${BASE_PATH}`), "") || "";
        const allowedPath = allowed.some(
          (href) => path === href || (href !== "/dashboard" && path.startsWith(href + "/"))
        );
        if (!allowedPath) {
          router.replace(`${BASE_PATH}/dashboard`);
          return;
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => { cancelled = true; };
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
