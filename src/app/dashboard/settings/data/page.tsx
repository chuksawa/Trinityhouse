"use client";

import Link from "next/link";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function DataSettingsPage() {
  function exportPeople() {
    const url = `${BASE_PATH}/api/settings/export/people/`;
    window.open(url, "_blank", "noopener");
  }

  function exportEvents() {
    const url = `${BASE_PATH}/api/settings/export/events/`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Data & Integrations</h1>
        <p className="text-sm text-gray-500">Export data and manage integrations.</p>
      </div>

      <div className="card max-w-xl space-y-6 p-6">
        <h3 className="text-base font-semibold text-gray-900">Export data</h3>
        <p className="text-sm text-gray-500">Download your data as CSV. Files open in Excel or any spreadsheet app.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportPeople} className="btn-primary">Export people (CSV)</button>
          <button type="button" onClick={exportEvents} className="btn-primary">Export events (CSV)</button>
        </div>
      </div>

      <div className="card max-w-xl space-y-6 p-6">
        <h3 className="text-base font-semibold text-gray-900">Integrations</h3>
        <p className="text-sm text-gray-500">Connect third-party services and API keys. Coming soon.</p>
      </div>
    </div>
  );
}
