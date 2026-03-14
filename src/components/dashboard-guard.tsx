"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DEFAULT_NAV_BY_ROLE: Record<string, string[] | null> = {
  superuser: null,
  admin: null,
  senior_staff: ["/home", "/dashboard", "/dashboard/people", "/dashboard/groups", "/dashboard/events", "/dashboard/communication", "/dashboard/content"],
  staff: ["/home", "/dashboard", "/dashboard/groups", "/dashboard/events", "/dashboard/communication"],
  user: ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"],
};

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
        const defaultForRole = role ? DEFAULT_NAV_BY_ROLE[role] : undefined;
        const allowed =
          role && config.navVisibility?.[role] !== undefined
            ? config.navVisibility[role]
            : defaultForRole !== undefined
              ? defaultForRole
              : null;
        if (allowed === null) {
          setReady(true);
          return;
        }
        const path = pathname?.replace(new RegExp(`^${BASE_PATH}`), "") || "";
        const allowedPath = allowed.some(
          (href: string) => path === href || (href !== "/dashboard" && path.startsWith(href + "/"))
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
