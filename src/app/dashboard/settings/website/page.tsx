"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function WebsiteSettingsPage() {
  const [profile, setProfile] = useState<{ websiteUrl?: string; showEventsPublic?: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/settings/profile/`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProfile({ websiteUrl: data.websiteUrl, showEventsPublic: data.showEventsPublic });
      } catch {
        if (!cancelled) setProfile({});
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const publicBase = typeof window !== "undefined" ? `${window.location.origin}${BASE_PATH}` : "";
  const homeUrl = `${publicBase}/home`;
  const eventsAnchor = `${publicBase}/home#events`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Website & Public Pages</h1>
        <p className="text-sm text-gray-500">Links to your public site and event listing.</p>
      </div>

      <div className="card max-w-xl space-y-6 p-6">
        <h3 className="text-base font-semibold text-gray-900">Public site</h3>
        <p className="text-sm text-gray-500">Your church homepage and public content are available at:</p>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-500">Homepage</span>
            <p className="mt-0.5">
              <a href={homeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-medium">{homeUrl}</a>
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Events section</span>
            <p className="mt-0.5">
              <a href={eventsAnchor} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-medium">{eventsAnchor}</a>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={homeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Open homepage</a>
          <Link href="/dashboard/settings/profile" className="btn-secondary">Edit church profile (address, service times)</Link>
        </div>
      </div>

      {profile && (
        <div className="card max-w-xl space-y-4 p-6">
          <h3 className="text-base font-semibold text-gray-900">Public listing</h3>
          <p className="text-sm text-gray-500">
            Events on the public site are {profile.showEventsPublic !== false ? "visible" : "hidden"}. Change this in <Link href="/dashboard/settings/profile" className="text-brand-600 hover:text-brand-700">Church Profile</Link>.
          </p>
        </div>
      )}

      {profile?.websiteUrl && (
        <div className="card max-w-xl p-6">
          <h3 className="text-base font-semibold text-gray-900">External website</h3>
          <p className="mt-1 text-sm text-gray-500">
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">{profile.websiteUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
}
