"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserCog, User, Users, UserCheck } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ALL_PAGES = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/people", label: "People & Care" },
  { href: "/dashboard/groups", label: "Groups & Teams" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/giving", label: "Giving" },
  { href: "/dashboard/communication", label: "Communication" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

const ALL_HREFS = ALL_PAGES.map((p) => p.href);

const ROLE_CONFIG: { key: string; label: string; description: string; icon: typeof Shield }[] = [
  { key: "superuser", label: "Superuser", description: "Top-level access. Restrict pages here if needed.", icon: Shield },
  { key: "admin", label: "Admin", description: "Admins who manage the dashboard. Choose which pages they can see.", icon: UserCog },
  { key: "senior_staff", label: "Senior Staff", description: "Senior staff dashboard access. Choose which pages they can see.", icon: UserCheck },
  { key: "staff", label: "Staff", description: "Staff dashboard access. Choose which pages they can see.", icon: Users },
  { key: "user", label: "Member (user)", description: "Regular members. Choose which pages they can see.", icon: User },
];

const DEFAULT_BY_ROLE: Record<string, string[]> = {
  superuser: [...ALL_HREFS],
  admin: [...ALL_HREFS],
  senior_staff: ["/home", "/dashboard", "/dashboard/people", "/dashboard/groups", "/dashboard/events", "/dashboard/communication", "/dashboard/content"],
  staff: ["/home", "/dashboard", "/dashboard/groups", "/dashboard/events", "/dashboard/communication"],
  user: ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"],
};

export default function VisibilitySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, string[]>>({
    superuser: [...DEFAULT_BY_ROLE.superuser],
    admin: [...DEFAULT_BY_ROLE.admin],
    senior_staff: [...DEFAULT_BY_ROLE.senior_staff],
    staff: [...DEFAULT_BY_ROLE.staff],
    user: [...DEFAULT_BY_ROLE.user],
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { user: null })),
      fetch(`${BASE_PATH}/api/settings/nav-visibility`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { navVisibility: {} })),
    ])
      .then(([session, config]) => {
        if (cancelled) return;
        const role = session.user?.role as string | undefined;
        setIsAdmin(role === "superuser" || role === "admin");
        const raw = config.navVisibility ?? {};
        setVisibility({
          superuser: Array.isArray(raw.superuser) ? raw.superuser : [...DEFAULT_BY_ROLE.superuser],
          admin: Array.isArray(raw.admin) ? raw.admin : [...DEFAULT_BY_ROLE.admin],
          senior_staff: Array.isArray(raw.senior_staff) ? raw.senior_staff : [...DEFAULT_BY_ROLE.senior_staff],
          staff: Array.isArray(raw.staff) ? raw.staff : [...DEFAULT_BY_ROLE.staff],
          user: Array.isArray(raw.user) ? raw.user : [...DEFAULT_BY_ROLE.user],
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function toggle(roleKey: string, href: string) {
    setVisibility((prev) => {
      const list = prev[roleKey] ?? [];
      const next = list.includes(href) ? list.filter((h) => h !== href) : [...list, href];
      return { ...prev, [roleKey]: next };
    });
  }

  function setAll(roleKey: string, checked: boolean) {
    setVisibility((prev) => ({
      ...prev,
      [roleKey]: checked ? [...ALL_HREFS] : [],
    }));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/settings/nav-visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ navVisibility: visibility }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">You don’t have permission to change dashboard visibility.</p>
        <p className="mt-1 text-sm">Only admins can configure which pages each role can see.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard visibility</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control which pages each role can see in the sidebar and open. Changes apply after save.
        </p>
      </div>

      {ROLE_CONFIG.map(({ key: roleKey, label, description, icon: Icon }) => {
        const hrefs = visibility[roleKey] ?? [];
        const allChecked = hrefs.length === ALL_HREFS.length;
        const noneChecked = hrefs.length === 0;
        return (
          <div key={roleKey} className="card max-w-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAll(roleKey, true)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setAll(roleKey, false)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  None
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            <ul className="mt-4 space-y-2">
              {ALL_PAGES.map((item) => (
                <li key={item.href}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={hrefs.includes(item.href)}
                      onChange={() => toggle(roleKey, item.href)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.href}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save visibility for all roles
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
