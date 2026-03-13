"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type UserRow = { id: number; email: string; role: string; createdAt: string };

export default function RolesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: UserRow[]; currentUserEmail: string; currentUserRole: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/settings/roles/`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Failed to load roles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <p className="text-red-600">{error ?? "Failed to load"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-sm text-gray-500">View who has access to the dashboard. Role changes require a superuser or database access.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="table-header text-left">Email</th>
                <th className="table-header text-left">Role</th>
                <th className="table-header text-left">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map((u) => (
                <tr key={u.id} className={u.email === data.currentUserEmail ? "bg-brand-50/50" : ""}>
                  <td className="table-cell font-medium text-gray-900">
                    {u.email}
                    {u.email === data.currentUserEmail && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                  </td>
                  <td className="table-cell">
                    <span className={u.role === "superuser" ? "badge-purple" : u.role === "user" ? "badge-blue" : "badge-gray"}>{u.role}</span>
                  </td>
                  <td className="table-cell text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Your role: <strong>{data.currentUserRole}</strong>. To add or change roles, use the database or run a seed script (superuser only).
        </div>
      </div>
    </div>
  );
}
