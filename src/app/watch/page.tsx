"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, ArrowLeft } from "lucide-react";
import PublicHeader from "@/components/public-header";
import { SiteFooterMinimal } from "@/components/site-footer";
import { formatDate } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type PublicSermon = {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
  duration: string;
  views: number;
  description: string;
};

export default function PublicWatchPage() {
  const [sermons, setSermons] = useState<PublicSermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/public/sermons/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { sermons: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.sermons)) setSermons(data.sermons);
      })
      .catch(() => {
        if (!cancelled) setSermons([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const latest = sermons[0] ?? null;
  const archive = sermons.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicHeader />

      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-12 sm:py-16">
        <Link href="/home" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Watch & Grow
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Latest teaching and sermon archive. No account needed.
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading…</p>
        ) : sermons.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">No sermons available yet.</p>
            <p className="mt-2 text-sm text-gray-500">Check back later for new teaching and messages.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {latest && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Latest</h2>
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl">
                  <div className="relative aspect-video w-full flex items-center justify-center bg-brand-900/50">
                    <button
                      type="button"
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform hover:scale-105"
                    >
                      <Play className="h-10 w-10 ml-1" fill="currentColor" />
                    </button>
                  </div>
                  <div className="p-6">
                    <span className="badge badge-purple">{latest.series}</span>
                    <h3 className="mt-3 text-xl font-bold text-white">{latest.title}</h3>
                    <p className="mt-1 text-brand-200">{latest.speaker} · {formatDate(latest.date)}</p>
                    {latest.description && (
                      <p className="mt-2 text-sm text-brand-100">{latest.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm text-brand-200">
                      <span>{latest.duration}</span>
                      <span>{latest.views} views</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {archive.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Sermon archive</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archive.map((sermon) => (
                    <div
                      key={sermon.id}
                      className="card overflow-hidden p-0 transition-all hover:shadow-md"
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
                          <span>·</span>
                          <span>{sermon.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooterMinimal />
    </div>
  );
}
