"use client";

import Link from "next/link";
import { Church, Shield, Bell, Palette, Database, Globe } from "lucide-react";

const sections: { title: string; description: string; icon: typeof Church; href?: string }[] = [
  {
    title: "Church Profile",
    description: "Name, address, service times, and public-facing information.",
    icon: Church,
    href: "/dashboard/settings/profile",
  },
  {
    title: "Roles & Permissions",
    description: "Control who can access each module and what actions they can take.",
    icon: Shield,
    href: "/dashboard/settings/roles",
  },
  {
    title: "Notifications",
    description: "Configure email, SMS, and push notification preferences.",
    icon: Bell,
    href: "/dashboard/settings/notifications",
  },
  {
    title: "Appearance",
    description: "Customize colors, logo, and branding for the app.",
    icon: Palette,
    // href omitted — coming later
  },
  {
    title: "Data & Integrations",
    description: "Import/export data, connect third-party services, and manage API keys.",
    icon: Database,
    href: "/dashboard/settings/data",
  },
  {
    title: "Website & Public Pages",
    description: "Manage your church website, event pages, and public sermon archive.",
    icon: Globe,
    href: "/dashboard/settings/website",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your church app configuration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) =>
          s.href ? (
            <Link
              key={s.title}
              href={s.href}
              className="card flex items-start gap-4 p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{s.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={s.title}
              className="card flex items-start gap-4 p-5 text-left opacity-75 cursor-not-allowed"
              title="Coming later"
            >
              <div className="rounded-lg bg-gray-100 p-2.5 text-gray-400">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{s.description}</p>
              </div>
            </div>
          )
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Role-Based Access Control
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Module</th>
                <th className="table-header text-center">Senior Pastor</th>
                <th className="table-header text-center">Staff</th>
                <th className="table-header text-center">Volunteer</th>
                <th className="table-header text-center">Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { module: "Dashboard Analytics", pastor: "full", staff: "full", volunteer: "limited", member: "none" },
                { module: "People & Care", pastor: "full", staff: "full", volunteer: "limited", member: "own" },
                { module: "Groups & Teams", pastor: "full", staff: "full", volunteer: "full", member: "view" },
                { module: "Events", pastor: "full", staff: "full", volunteer: "manage", member: "rsvp" },
                { module: "Giving", pastor: "full", staff: "reports", volunteer: "none", member: "own" },
                { module: "Communication", pastor: "full", staff: "full", volunteer: "limited", member: "receive" },
                { module: "Content", pastor: "full", staff: "full", volunteer: "view", member: "view" },
              ].map((row) => (
                <tr key={row.module}>
                  <td className="table-cell font-medium text-gray-900">{row.module}</td>
                  {[row.pastor, row.staff, row.volunteer, row.member].map((access, i) => (
                    <td key={i} className="table-cell text-center">
                      <span
                        className={
                          access === "full"
                            ? "badge-green"
                            : access === "none"
                            ? "badge-red"
                            : "badge-yellow"
                        }
                      >
                        {access}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
