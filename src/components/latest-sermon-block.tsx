"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { getVideoEmbedUrl } from "@/lib/utils";

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
  videoUrl?: string;
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
        <div className="relative aspect-video bg-brand-900/50">
          {latestSermon.videoUrl && getVideoEmbedUrl(latestSermon.videoUrl) ? (
            <iframe
              src={getVideoEmbedUrl(latestSermon.videoUrl)!}
              title={latestSermon.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-brand-200">
                <Play className="h-10 w-10 ml-1" fill="currentColor" />
                <span className="text-sm">No video linked</span>
              </div>
            </div>
          )}
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
