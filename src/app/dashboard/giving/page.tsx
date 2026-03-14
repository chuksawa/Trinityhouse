"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Heart,
  DollarSign,
  Repeat,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import StatCard from "@/components/stat-card";
import {
  cn,
  formatCurrency,
  formatDate,
  getInitials,
} from "@/lib/utils";
import type { Gift } from "@/lib/data";
import type { Person } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FUND_LABELS: Record<Gift["fund"], string> = {
  tithe: "Tithe",
  offering: "Offering",
  missions: "Missions",
  building_fund: "Building Fund",
  benevolence: "Benevolence",
};

const FUND_COLORS: Record<Gift["fund"], string> = {
  tithe: "bg-brand-600",
  offering: "bg-emerald-600",
  missions: "bg-amber-600",
  building_fund: "bg-blue-600",
  benevolence: "bg-rose-600",
};

const FUND_BADGE_CLASS: Record<Gift["fund"], string> = {
  tithe: "badge-purple",
  offering: "badge-green",
  missions: "badge-yellow",
  building_fund: "badge-blue",
  benevolence: "badge-red",
};

function formatMethod(method: Gift["method"]): string {
  return method.charAt(0).toUpperCase() + method.slice(1);
}

type DashboardGift = Omit<Gift, "personId"> & {
  personId: string | null;
  personName?: string;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function getPersonById(people: Person[], id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export default function GivingPage() {
  const [gifts, setGifts] = useState<DashboardGift[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/giving/gifts`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { gifts: [] })),
      fetch(`${BASE_PATH}/api/people`, { credentials: "include" }).then((r) => (r.ok ? r.json() : { people: [] })),
    ]).then(([giftsData, peopleData]) => {
      if (!cancelled) {
        setGifts(Array.isArray(giftsData.gifts) ? giftsData.gifts : []);
        setPeople(Array.isArray(peopleData.people) ? peopleData.people : []);
      }
    }).catch(() => {
      if (!cancelled) setGifts([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const giftsThisMonth = useMemo(
    () => gifts.filter((g) => g.date.startsWith(monthStart) && g.amount > 0),
    [gifts, monthStart]
  );

  const totalGivingMTD = useMemo(
    () => giftsThisMonth.reduce((sum, g) => sum + g.amount, 0),
    [giftsThisMonth]
  );

  const recurringGiversCount = useMemo(() => {
    const ids = new Set<string>();
    giftsThisMonth.forEach((g) => {
      if (g.recurring && g.personId) ids.add(g.personId);
    });
    return ids.size;
  }, [giftsThisMonth]);

  const firstTimeGiversCount = useMemo(() => {
    const gaveBeforeThisMonth = new Set<string>();
    gifts.forEach((g) => {
      if (g.date < `${monthStart}-01`) gaveBeforeThisMonth.add(g.personId ?? "guest");
    });
    const firstTimeIds = new Set<string>();
    giftsThisMonth.forEach((g) => {
      if (!gaveBeforeThisMonth.has(g.personId ?? "guest")) firstTimeIds.add(g.personId ?? "guest");
    });
    return firstTimeIds.size;
  }, [gifts, giftsThisMonth, monthStart]);

  const recentGifts = useMemo(
    () =>
      [...gifts]
        .filter((g) => g.amount > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    [gifts]
  );

  const givingByFund = useMemo(() => {
    const byFund: Record<Gift["fund"], number> = {
      tithe: 0,
      offering: 0,
      missions: 0,
      building_fund: 0,
      benevolence: 0,
    };
    gifts.filter((g) => g.amount > 0).forEach((g) => {
      const fund = g.fund in byFund ? g.fund : "offering";
      byFund[fund] += g.amount;
    });
    const total = Object.values(byFund).reduce((s, v) => s + v, 0);
    return { byFund, total };
  }, [gifts]);

  const givingHistory = useMemo(() => {
    const byMonth: Record<string, number> = {};
    gifts.forEach((g) => {
      if (g.amount > 0 && g.date) {
        const m = g.date.slice(0, 7);
        byMonth[m] = (byMonth[m] || 0) + g.amount;
      }
    });
    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
  }, [gifts]);

  const lapsedGivers = useMemo(() => {
    const lastGiftByPerson = new Map<string, string>();
    gifts.forEach((g) => {
      if (g.amount > 0 && g.personId) {
        const current = lastGiftByPerson.get(g.personId) ?? "0000-00-00";
        if (g.date > current) lastGiftByPerson.set(g.personId, g.date);
      }
    });
    const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);
    return people
      .filter((p) => {
        const last = lastGiftByPerson.get(p.id);
        return last && last < cutoff;
      })
      .map((p) => ({
        person: p,
        lastGift: lastGiftByPerson.get(p.id)!,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastGift).getTime() - new Date(a.lastGift).getTime()
      );
  }, [gifts, people, thirtyDaysAgo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading giving data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Giving & Generosity
        </h1>
        <p className="text-sm text-gray-500">
          Track donations, trends, and engagement
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Giving MTD"
          value={formatCurrency(totalGivingMTD)}
          icon={Heart}
          iconColor="text-rose-600 bg-rose-50"
        />
        <StatCard
          label="Total Gifts"
          value={giftsThisMonth.length}
          icon={DollarSign}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Recurring Givers"
          value={recurringGiversCount}
          icon={Repeat}
          iconColor="text-brand-600 bg-brand-50"
        />
        <StatCard
          label="First-Time Givers"
          value={firstTimeGiversCount}
          icon={UserPlus}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Giving Trend Chart */}
      <div className="card p-5">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Giving Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={givingHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
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
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Giving",
                ]}
              />
              <Bar
                dataKey="amount"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Gifts Table */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
            <h3 className="text-base font-semibold text-gray-900">
              Recent Gifts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Donor</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Fund</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Recurring</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentGifts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="table-cell py-8 text-center text-gray-500"
                    >
                      No recent gifts.
                    </td>
                  </tr>
                ) : (
                  recentGifts.map((gift) => {
                    const person = gift.personId ? getPersonById(people, gift.personId) : undefined;
                    const name = gift.personName ?? (person ? `${person.firstName} ${person.lastName}` : "Guest");
                    return (
                      <tr
                        key={gift.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                                person?.avatarColor ?? "bg-gray-400"
                              )}
                            >
                              {person
                                ? getInitials(person.firstName, person.lastName)
                                : "?"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell font-medium text-gray-900">
                          {formatCurrency(gift.amount)}
                        </td>
                        <td className="table-cell">
                          <span
                            className={cn(
                              "badge",
                              FUND_BADGE_CLASS[gift.fund]
                            )}
                          >
                            {FUND_LABELS[gift.fund]}
                          </span>
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatMethod(gift.method)}
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatDate(gift.date)}
                        </td>
                        <td className="table-cell">
                          {gift.recurring ? (
                            <span className="badge badge-green">Yes</span>
                          ) : (
                            <span className="badge badge-gray">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Giving by Fund & Lapsed Givers */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Giving by Fund
            </h3>
            <div className="space-y-4">
              {(Object.entries(givingByFund.byFund) as [Gift["fund"], number][])
                .filter(([, amt]) => amt > 0)
                .map(([fund, amount]) => {
                  const pct =
                    givingByFund.total > 0
                      ? (amount / givingByFund.total) * 100
                      : 0;
                  return (
                    <div key={fund} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {FUND_LABELS[fund]}
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            FUND_COLORS[fund]
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <ClipboardList className="h-4 w-4 text-amber-600" />
              Lapsed Givers
            </h3>
            {lapsedGivers.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                No lapsed givers in the last 30 days.
              </p>
            ) : (
              <ul className="space-y-3">
                {lapsedGivers.slice(0, 5).map(({ person, lastGift }) => (
                  <li
                    key={person.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
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
                        Last gave {formatDate(lastGift)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary shrink-0 text-xs"
                    >
                      Follow up
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
