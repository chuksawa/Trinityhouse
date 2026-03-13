"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type ServiceTime = { day?: string; times?: string; label?: string };

export default function ChurchProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [showEventsPublic, setShowEventsPublic] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/settings/profile/`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (cancelled) return;
        setName(data.name ?? "");
        setAddress(data.address ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setServiceTimes(Array.isArray(data.serviceTimes) && data.serviceTimes.length ? data.serviceTimes : [{ day: "Sunday", times: "9:00 AM & 11:00 AM", label: "Worship" }, { day: "Wednesday", times: "7:00 PM", label: "Midweek" }]);
        setWebsiteUrl(data.websiteUrl ?? "");
        setShowEventsPublic(data.showEventsPublic !== false);
      } catch {
        if (!cancelled) setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/settings/profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || "Trinity House",
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          serviceTimes,
          websiteUrl: websiteUrl.trim(),
          showEventsPublic,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
        setSaving(false);
        return;
      }
      setMessage({ type: "success", text: "Profile saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    }
    setSaving(false);
  }

  function updateServiceTime(i: number, field: keyof ServiceTime, value: string) {
    const next = [...serviceTimes];
    if (!next[i]) next[i] = {};
    next[i] = { ...next[i], [field]: value };
    setServiceTimes(next);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Church Profile</h1>
        <p className="text-sm text-gray-500">Name, address, service times, and public-facing information.</p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-6 p-6">
        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Church name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Trinity House" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-[80px]" rows={3} placeholder="Full address" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="(555) 100-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="hello@trinityhouse.org" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service times</label>
          <div className="space-y-3">
            {serviceTimes.map((st, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 sm:gap-3">
                <input type="text" value={st.day ?? ""} onChange={(e) => updateServiceTime(i, "day", e.target.value)} className="input w-28" placeholder="Day" />
                <input type="text" value={st.times ?? ""} onChange={(e) => updateServiceTime(i, "times", e.target.value)} className="input flex-1 min-w-[120px]" placeholder="Times" />
                <input type="text" value={st.label ?? ""} onChange={(e) => updateServiceTime(i, "label", e.target.value)} className="input w-28" placeholder="Label" />
                <button type="button" onClick={() => setServiceTimes(serviceTimes.filter((_, j) => j !== i))} className="text-sm text-red-600 hover:text-red-700">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setServiceTimes([...serviceTimes, {}])} className="text-sm font-medium text-brand-600 hover:text-brand-700">+ Add service time</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="input" placeholder="https://..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="show-events" checked={showEventsPublic} onChange={(e) => setShowEventsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
          <label htmlFor="show-events" className="text-sm text-gray-700">Show events on public site</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save changes"}</button>
          <Link href="/dashboard/settings" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
