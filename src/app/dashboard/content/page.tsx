"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Play, Share2, Bookmark, Download, Globe } from "lucide-react";
import Modal from "@/components/modal";
import { formatDate } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type DashboardSermon = {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
  duration: string;
  views: number;
  description: string;
  showPublic: boolean;
};

const READING_PLANS = [
  {
    id: "rp1",
    title: "21 Days of Prayer",
    description: "Build a lasting prayer habit with daily reflections and scripture.",
    duration: "21 days",
  },
  {
    id: "rp2",
    title: "Gospel of John Study",
    description: "Deep dive into the fourth gospel with guided questions and commentary.",
    duration: "12 weeks",
  },
  {
    id: "rp3",
    title: "Marriage Foundations",
    description: "Strengthen your marriage with biblical principles and practical exercises.",
    duration: "6 weeks",
  },
];

export default function ContentPage() {
  const [sermons, setSermons] = useState<DashboardSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSermon, setSelectedSermon] = useState<DashboardSermon | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/sermons`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { sermons: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.sermons)) {
          setSermons(data.sermons.map((s: { showPublic?: boolean } & DashboardSermon) => ({
            ...s,
            showPublic: s.showPublic ?? true,
          })));
        }
      })
      .catch(() => { if (!cancelled) setSermons([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const latestSermon = useMemo(() => sermons[0] ?? null, [sermons]);
  const sermonArchive = useMemo(() => sermons.slice(1), [sermons]);
  const seriesList = useMemo(() => {
    const map = new Map<string, number>();
    sermons.forEach((s) => {
      map.set(s.series, (map.get(s.series) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [sermons]);

  async function setShowPublic(id: string, showPublic: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`${BASE_PATH}/api/sermons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ showPublic }),
      });
      if (res.ok) {
        setSermons((prev) =>
          prev.map((s) => (s.id === id ? { ...s, showPublic } : s))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content & Discipleship</h1>
        <button type="button" className="btn-primary whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Upload Sermon
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading content…</p>
      ) : (
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1 space-y-8">
          {/* Featured / Latest Sermon Hero */}
          {latestSermon && (
            <div className="card overflow-hidden">
              <div className="relative aspect-video w-full bg-gradient-to-br from-brand-600 via-brand-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-lg transition-all hover:scale-110 hover:bg-white"
                  >
                    <Play className="h-10 w-10 ml-1" fill="currentColor" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <span className="badge-purple">{latestSermon.series}</span>
                  <h2 className="mt-2 text-2xl font-bold text-white">{latestSermon.title}</h2>
                  <p className="mt-1 text-sm text-white/90">{latestSermon.speaker}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
                    <span>{formatDate(latestSermon.date)}</span>
                    <span>{latestSermon.duration}</span>
                    <span>{latestSermon.views} views</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600">{latestSermon.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-primary">
                    <Play className="h-4 w-4" />
                    Watch
                  </button>
                  <button type="button" className="btn-secondary">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button type="button" className="btn-ghost">
                    <Bookmark className="h-4 w-4" />
                    Save
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                  <input
                    id={`show-public-${latestSermon.id}`}
                    type="checkbox"
                    checked={latestSermon.showPublic}
                    disabled={togglingId === latestSermon.id}
                    onChange={(e) => setShowPublic(latestSermon.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor={`show-public-${latestSermon.id}`} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Globe className="h-4 w-4" />
                    Show on public site
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Sermon Archive */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Sermon Archive</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sermonArchive.map((sermon) => (
                <button
                  key={sermon.id}
                  type="button"
                  onClick={() => setSelectedSermon(sermon)}
                  className="card overflow-hidden p-0 text-left transition-all hover:shadow-md hover:ring-2 hover:ring-brand-500/20"
                >
                  <div className="relative aspect-video w-full bg-gradient-to-br from-slate-600 to-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <Play className="h-7 w-7 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 badge-purple text-[10px]">
                      {sermon.series}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{sermon.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{sermon.speaker}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(sermon.date)}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>{sermon.duration}</span>
                      <span>•</span>
                      <span>{sermon.views} views</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                      <input
                        id={`show-public-${sermon.id}`}
                        type="checkbox"
                        checked={sermon.showPublic}
                        disabled={togglingId === sermon.id}
                        onChange={(e) => { e.stopPropagation(); setShowPublic(sermon.id, e.target.checked); }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor={`show-public-${sermon.id}`} className="flex items-center gap-1 text-xs text-gray-600" onClick={(e) => e.stopPropagation()}>
                        <Globe className="h-3.5 w-3.5" />
                        Show on public site
                      </label>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reading Plans */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Reading Plans</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {READING_PLANS.map((plan) => (
                <div key={plan.id} className="card p-5">
                  <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  <p className="mt-2 text-xs text-gray-500">{plan.duration}</p>
                  <button type="button" className="btn-secondary mt-4 w-full">
                    Start Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sermon Series Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900">Sermon Series</h3>
            <ul className="mt-4 space-y-3">
              {seriesList.map(({ name, count }) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      )}
      {/* Sermon Detail Modal */}
      <Modal
        open={!!selectedSermon}
        onClose={() => setSelectedSermon(null)}
        title={selectedSermon?.title ?? "Sermon"}
        wide
      >
        {selectedSermon && (() => {
          const current = sermons.find((s) => s.id === selectedSermon.id) ?? selectedSermon;
          return (
          <div className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-600 to-slate-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-lg transition-all hover:scale-105 hover:bg-white"
                >
                  <Play className="h-8 w-8 ml-1" fill="currentColor" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge-purple">{current.series}</span>
              <span className="text-sm text-gray-600">{current.speaker}</span>
              <span className="text-sm text-gray-500">{formatDate(current.date)}</span>
              <span className="text-sm text-gray-500">{current.duration}</span>
              <span className="text-sm text-gray-500">{current.views} views</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1 text-gray-700">{current.description}</p>
            </div>
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <input
                id="modal-show-public"
                type="checkbox"
                checked={current.showPublic}
                disabled={togglingId === current.id}
                onChange={(e) => setShowPublic(current.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="modal-show-public" className="flex items-center gap-1.5 text-sm text-gray-700">
                <Globe className="h-4 w-4" />
                Show on public site
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button type="button" className="btn-secondary">
                <Bookmark className="h-4 w-4" />
                Save
              </button>
              <button type="button" className="btn-ghost">
                <Download className="h-4 w-4" />
                Download Notes
              </button>
            </div>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
