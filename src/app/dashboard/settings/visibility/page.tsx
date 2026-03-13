"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ALL_NAV_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/people", label: "People & Care" },
  { href: "/dashboard/groups", label: "Groups & Teams" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/giving", label: "Giving" },
  { href: "/dashboard/communication", label: "Communication" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function VisibilitySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userHrefs, setUserHrefs] = useState<string[]>([]);

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
        const forUser = config.navVisibility?.user;
        setUserHrefs(Array.isArray(forUser) ? forUser : ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"]);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function toggle(href: string) {
    setUserHrefs((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/settings/nav-visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ navVisibility: { user: userHrefs } }),
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
      <div className="flex items-center justify-center py-12">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard visibility</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose which dashboard pages <strong>Members</strong> (user role) can see in the sidebar and open. Admins always see all pages.
        </p>
      </div>

      <div className="card max-w-2xl p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Eye className="h-5 w-5" />
          Member (user role) can see
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Clear all to hide dashboard from members until you add at least Dashboard.
        </p>
        <ul className="mt-4 space-y-2">
          {ALL_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg py-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={userHrefs.includes(item.href)}
                  onChange={() => toggle(item.href)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="text-xs text-gray-500">{item.href}</span>
              </label>
            </li>
          ))}
        </ul>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
