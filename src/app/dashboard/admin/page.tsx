"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserCheck, UserX, UserCog } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type PendingItem = { id: number; email: string; requestedAt: string; registrationType?: string };
type UserItem = { id: number; email: string; role: string; status: string; createdAt: string };

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState("");
  const [actioning, setActioning] = useState<number | null>(null);

  function loadSession() {
    return fetch(`${BASE_PATH}/api/auth/session/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => data.user?.role === "superuser");
  }

  function loadData() {
    return Promise.all([
      fetch(`${BASE_PATH}/api/admin/pending/`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${BASE_PATH}/api/admin/users/`, { credentials: "include" }).then((r) => r.json()),
    ]);
  }

  useEffect(() => {
    let cancelled = false;
    loadSession().then((su) => {
      if (cancelled) return;
      if (!su) {
        router.replace(`${BASE_PATH}/dashboard/`);
        return;
      }
      setIsSuperuser(true);
      loadData().then(([pendingRes, usersRes]) => {
        if (cancelled) return;
        if (pendingRes.pending) setPending(pendingRes.pending);
        if (usersRes.users) setUsers(usersRes.users);
        if (pendingRes.error || usersRes.error) setError(pendingRes.error || usersRes.error);
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [router]);

  function refresh() {
    loadData().then(([pendingRes, usersRes]) => {
      if (pendingRes.pending) setPending(pendingRes.pending);
      if (usersRes.users) setUsers(usersRes.users);
    });
  }

  async function handleApprove(userId: number) {
    setActioning(userId);
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/approve/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to approve");
        return;
      }
      refresh();
    } finally {
      setActioning(null);
    }
  }

  async function handleReject(userId: number) {
    if (!confirm("Reject this registration? They can register again later.")) return;
    setActioning(userId);
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/reject/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to reject");
        return;
      }
      refresh();
    } finally {
      setActioning(null);
    }
  }

  async function handleSetRole(userId: number, role: "admin" | "user") {
    setActioning(userId);
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/users/${userId}/role/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to update role");
        return;
      }
      refresh();
    } finally {
      setActioning(null);
    }
  }

  if (!isSuperuser && !loading) return null;
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-7 w-7 text-brand-600" />
          Admin
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve registrations and manage user roles. The superuser cannot be modified.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Pending registrations */}
      <section className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-brand-600" />
          Pending registration requests
        </h2>
        {pending.length === 0 ? (
          <p className="px-4 py-6 text-gray-500 text-sm">No pending requests.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    {p.email}
                    {p.registrationType === "staff" && (
                      <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Staff</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Requested {new Date(p.requestedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id)}
                    disabled={actioning !== null}
                    className="btn-primary text-sm inline-flex items-center gap-1.5"
                  >
                    {actioning === p.id ? "…" : null}
                    <UserCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(p.id)}
                    disabled={actioning !== null}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5"
                  >
                    <UserX className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Users & roles */}
      <section className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-brand-600" />
          Users & roles
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="table-header text-left">Email</th>
                <th className="table-header text-left">Role</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Added</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="table-cell font-medium text-gray-900">{u.email}</td>
                  <td className="table-cell">
                    <span className={u.role === "superuser" ? "badge-purple" : u.role === "admin" ? "badge-blue" : "badge-gray"}>
                      {u.role}
                    </span>
                    {u.role === "superuser" && (
                      <span className="ml-2 text-xs text-gray-500">(cannot be modified)</span>
                    )}
                  </td>
                  <td className="table-cell text-gray-600">{u.status}</td>
                  <td className="table-cell text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell text-right">
                    {u.role === "superuser" ? (
                      "—"
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "user" ? (
                          <button
                            type="button"
                            onClick={() => handleSetRole(u.id, "admin")}
                            disabled={actioning !== null}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            {actioning === u.id ? "…" : "Elevate to admin"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetRole(u.id, "user")}
                            disabled={actioning !== null}
                            className="text-sm font-medium text-gray-600 hover:text-gray-700"
                          >
                            {actioning === u.id ? "…" : "Revoke admin"}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
