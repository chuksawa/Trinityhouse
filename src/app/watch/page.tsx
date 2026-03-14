"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, ArrowLeft, FileText, Image as ImageIcon, Video } from "lucide-react";
import PublicHeader from "@/components/public-header";
import { SiteFooterMinimal } from "@/components/site-footer";
import { formatDate, getVideoEmbedUrl } from "@/lib/utils";

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
  videoUrl?: string;
};

type PublicContentItem = {
  id: string;
  type: "article" | "image" | "video";
  title: string;
  description: string;
  author: string;
  body: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: string;
  createdAt: string;
};

export default function PublicWatchPage() {
  const [sermons, setSermons] = useState<PublicSermon[]>([]);
  const [content, setContent] = useState<PublicContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/public/sermons/`, { credentials: "include" }).then((res) => (res.ok ? res.json() : { sermons: [] })),
      fetch(`${BASE_PATH}/api/public/content`).then((res) => (res.ok ? res.json() : { content: [] })),
    ])
      .then(([sermonData, contentData]) => {
        if (!cancelled && Array.isArray(sermonData.sermons)) setSermons(sermonData.sermons);
        if (!cancelled && Array.isArray(contentData.content)) setContent(contentData.content);
      })
      .catch(() => {
        if (!cancelled) setSermons([]);
        if (!cancelled) setContent([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const latest = sermons[0] ?? null;
  const archive = sermons.slice(1);
  const videos = content.filter((c) => c.type === "video");
  const articles = content.filter((c) => c.type === "article");
  const images = content.filter((c) => c.type === "image");

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
        ) : sermons.length === 0 && content.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">No sermons or content available yet.</p>
            <p className="mt-2 text-sm text-gray-500">Check back later for new teaching and messages.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {latest && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Latest</h2>
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl">
                  <div className="relative aspect-video w-full bg-brand-900/50">
                    {latest.videoUrl && getVideoEmbedUrl(latest.videoUrl) ? (
                      <iframe
                        src={getVideoEmbedUrl(latest.videoUrl)!}
                        title={latest.title}
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
                        {sermon.videoUrl && getVideoEmbedUrl(sermon.videoUrl) ? (
                          <iframe
                            src={getVideoEmbedUrl(sermon.videoUrl)!}
                            title={sermon.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1 text-white/80">
                              <Play className="h-7 w-7 ml-1" fill="currentColor" />
                              <span className="text-[10px]">No video</span>
                            </div>
                          </div>
                        )}
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

            {/* Public content: videos, articles, images (from Create content) */}
            {content.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Videos, articles & more</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Additional videos, articles, and images published by the church.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {content.map((item) => (
                    <div key={item.id} className="card overflow-hidden p-0 transition-all hover:shadow-md">
                      <div className="relative aspect-video w-full bg-gray-100">
                        {item.type === "video" && item.videoUrl && getVideoEmbedUrl(item.videoUrl) ? (
                          <iframe
                            src={getVideoEmbedUrl(item.videoUrl)!}
                            title={item.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            {item.type === "article" && <FileText className="h-10 w-10" />}
                            {item.type === "image" && <ImageIcon className="h-10 w-10" />}
                            {item.type === "video" && <Video className="h-10 w-10" />}
                          </div>
                        )}
                        <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium capitalize text-white">
                          {item.type}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                        {item.author && <p className="mt-1 text-sm text-gray-600">{item.author}</p>}
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                        )}
                        {item.duration && (
                          <p className="mt-1 text-xs text-gray-500">{item.duration}</p>
                        )}
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
