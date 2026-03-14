"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Sermon = {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
  duration: string;
  views: number;
  description: string;
};

export default function LatestSermonBlock() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_PATH}/api/public/sermons`)
      .then((r) => r.json())
      .then((data) => setSermons(data.sermons ?? []))
      .catch(() => setSermons([]))
      .finally(() => setLoading(false));
  }, []);

  const latestSermon = sermons[0];

  if (loading) {
    return (
      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl">
        <div className="flex aspect-video items-center justify-center bg-brand-900/50">
          <p className="text-brand-200">Loading…</p>
        </div>
      </div>
    );
  }

  if (!latestSermon) {
    return (
      <>
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No sermons published yet. Check back soon.</p>
          <Link
            href="/watch"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Sermon archive <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Link
          href="/watch"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Browse sermon archive <ArrowRight className="h-4 w-4" />
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl">
        <div className="relative aspect-video flex items-center justify-center bg-brand-900/50">
          <button
            type="button"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform hover:scale-105"
          >
            <Play className="h-10 w-10 ml-1" fill="currentColor" />
          </button>
        </div>
        <div className="p-6">
          <span className="badge badge-purple">{latestSermon.series}</span>
          <h3 className="mt-3 text-xl font-bold text-white">
            {latestSermon.title}
          </h3>
          <p className="mt-1 text-brand-200">
            {latestSermon.speaker} · {latestSermon.date}
          </p>
          <p className="mt-2 text-sm text-brand-100">
            {latestSermon.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-brand-200">
            <span>{latestSermon.duration}</span>
            <span>{latestSermon.views} views</span>
          </div>
        </div>
      </div>
      <Link
        href="/watch"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Browse sermon archive <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}
