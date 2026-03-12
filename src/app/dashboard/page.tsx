"use client";

import StatCard from "@/components/stat-card";
import { cn, formatCurrency, formatDate, timeAgo, getInitials } from "@/lib/utils";
import {
  dashboardStats,
  attendanceHistory,
  givingHistory,
  people,
  events,
  prayerRequests,
  getPersonById,
} from "@/lib/data";
import { Users, TrendingUp, Heart, HandHeart, Calendar, HeartHandshake } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const atRiskPeople = people.filter((p) => p.status === "at_risk" || p.status === "inactive");
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);
  const activePrayers = prayerRequests.filter((pr) => pr.status === "active");
  const funnel = dashboardStats.newcomersFunnel;

  return (
    <div className="space-y-6">
      {/* Page title area */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Church health at a glance</p>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={dashboardStats.totalMembers}
          change={undefined}
          icon={Users}
          iconColor="text-brand-600 bg-brand-50"
        />
        <StatCard
          label="Average Attendance"
          value={dashboardStats.avgAttendance}
          change={dashboardStats.attendanceChange}
          icon={TrendingUp}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Giving (MTD)"
          value={formatCurrency(dashboardStats.totalGivingMTD)}
          change={dashboardStats.givingChange}
          icon={Heart}
          iconColor="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="Volunteers Serving"
          value={dashboardStats.volunteersServing}
          change={dashboardStats.volunteerChange}
          icon={HandHeart}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Attendance Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceHistory}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#attendanceGradient)"
                  name="Attendance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Giving Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={givingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Giving"]}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Newcomer Funnel + Follow-ups row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Newcomer Funnel
          </h3>
          <div className="space-y-4">
            {[
              { label: "Visited", value: funnel.visited, color: "bg-gray-300" },
              { label: "Connected", value: funnel.connected, color: "bg-brand-300" },
              { label: "Joined", value: funnel.joined, color: "bg-brand-500" },
              { label: "Serving", value: funnel.serving, color: "bg-brand-600" },
            ].map((step, idx) => {
              const max = funnel.visited || 1;
              const pct = (step.value / max) * 100;
              return (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{step.label}</span>
                    <span className="text-gray-500">{step.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn("h-full rounded-full transition-all", step.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Follow-ups & At-Risk
          </h3>
          {atRiskPeople.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">No at-risk members at this time.</p>
          ) : (
            <ul className="space-y-3">
              {atRiskPeople.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                      person.avatarColor
                    )}
                  >
                    {getInitials(person.firstName, person.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last seen {timeAgo(person.lastAttendance)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "badge shrink-0",
                      person.status === "at_risk" ? "badge-yellow" : "badge-red"
                    )}
                  >
                    {person.status === "at_risk" ? "At risk" : "Inactive"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Upcoming Events + Active Prayer Requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Calendar className="h-4 w-4 text-brand-600" />
            Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.date)} · {event.time}
                    </p>
                  </div>
                  <span className="badge badge-blue shrink-0">
                    {event.registered}/{event.capacity} registered
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <HeartHandshake className="h-4 w-4 text-brand-600" />
            Active Prayer Requests
          </h3>
          {activePrayers.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">No active prayer requests.</p>
          ) : (
            <ul className="space-y-3">
              {activePrayers.map((pr) => {
                const person = getPersonById(pr.personId);
                const name = person
                  ? `${person.firstName} ${person.lastName}`
                  : "Unknown";
                return (
                  <li
                    key={pr.id}
                    className="rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                  >
                    <p className="mb-1 font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-600">{pr.request}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <span className="badge badge-purple">{pr.prayerCount} praying</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
