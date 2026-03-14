"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Play, Share2, Bookmark, Download, Globe, Pencil, Trash2, FileText, Image as ImageIcon, Video } from "lucide-react";
import Modal from "@/components/modal";
import { formatDate, getVideoEmbedUrl } from "@/lib/utils";

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
  videoUrl?: string;
};

type ContentTypeChoice = "sermon" | "article" | "image" | "video";

type ContentItem = {
  id: string;
  type: "article" | "image" | "video";
  title: string;
  description: string;
  author: string;
  body: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: string;
  showPublic: boolean;
  createdAt: string;
};

/** Reading plans come from API or CMS when available; no seeded data. */
const READING_PLANS: { id: string; title: string; description: string; duration: string }[] = [];

export default function ContentPage() {
  const [sermons, setSermons] = useState<DashboardSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSermon, setSelectedSermon] = useState<DashboardSermon | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createStep, setCreateStep] = useState<ContentTypeChoice | "type">("type");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSpeaker, setUploadSpeaker] = useState("");
  const [uploadSeries, setUploadSeries] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [uploadDuration, setUploadDuration] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadVideoUrl, setUploadVideoUrl] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [uploadBody, setUploadBody] = useState("");
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const [uploadShowPublic, setUploadShowPublic] = useState(true);
  const [uploadSaving, setUploadSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentTogglingId, setContentTogglingId] = useState<string | null>(null);

  const [editingSermon, setEditingSermon] = useState<DashboardSermon | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editSeries, setEditSeries] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadSermons() {
    fetch(`${BASE_PATH}/api/sermons`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { sermons: [] }))
      .then((data) => {
        if (Array.isArray(data.sermons)) {
          setSermons(data.sermons.map((s: { showPublic?: boolean } & DashboardSermon) => ({
            ...s,
            showPublic: s.showPublic ?? true,
          })));
        }
      })
      .catch(() => setSermons([]));
  }

  function loadContent() {
    fetch(`${BASE_PATH}/api/content`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { content: [] }))
      .then((data) => {
        if (Array.isArray(data.content)) setContentItems(data.content);
      })
      .catch(() => setContentItems([]));
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE_PATH}/api/sermons`, { credentials: "include" }).then((res) => (res.ok ? res.json() : { sermons: [] })),
      fetch(`${BASE_PATH}/api/content`, { credentials: "include" }).then((res) => (res.ok ? res.json() : { content: [] })),
    ]).then(([sermonData, contentData]) => {
      if (!cancelled && Array.isArray(sermonData.sermons)) {
        setSermons(sermonData.sermons.map((s: { showPublic?: boolean } & DashboardSermon) => ({
          ...s,
          showPublic: s.showPublic ?? true,
        })));
      }
      if (!cancelled && Array.isArray(contentData.content)) setContentItems(contentData.content);
    }).catch(() => { if (!cancelled) setSermons([]); })
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

  async function setContentShowPublic(id: string, showPublic: boolean) {
    setContentTogglingId(id);
    try {
      const res = await fetch(`${BASE_PATH}/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ show_public: showPublic }),
      });
      if (res.ok) {
        setContentItems((prev) =>
          prev.map((c) => (c.id === id ? { ...c, showPublic } : c))
        );
      }
    } finally {
      setContentTogglingId(null);
    }
  }

  function resetCreateForm() {
    setUploadTitle("");
    setUploadSpeaker("");
    setUploadSeries("");
    setUploadDate("");
    setUploadDuration("");
    setUploadDescription("");
    setUploadVideoUrl("");
    setUploadAuthor("");
    setUploadBody("");
    setUploadImageUrl("");
    setUploadShowPublic(true);
    setCreateStep("type");
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploadError("");

    if (createStep === "sermon") {
      if (!uploadTitle.trim() || !uploadSpeaker.trim() || !uploadSeries.trim() || !uploadDate.trim()) {
        setUploadError("Title, speaker, series, and date are required.");
        return;
      }
    } else if (createStep === "article" || createStep === "image" || createStep === "video") {
      if (!uploadTitle.trim()) {
        setUploadError("Title is required.");
        return;
      }
      if (createStep === "image" && !uploadImageUrl.trim()) {
        setUploadError("Image URL is required for images.");
        return;
      }
    }

    setUploadSaving(true);
    try {
      if (createStep === "sermon") {
        const res = await fetch(`${BASE_PATH}/api/sermons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: uploadTitle.trim(),
            speaker: uploadSpeaker.trim(),
            series: uploadSeries.trim(),
            date: uploadDate.trim(),
            duration: uploadDuration.trim() || undefined,
            description: uploadDescription.trim() || undefined,
            video_url: uploadVideoUrl.trim() || undefined,
            show_public: uploadShowPublic,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setUploadError(data.error || "Failed to add sermon");
          return;
        }
        loadSermons();
      } else {
        const res = await fetch(`${BASE_PATH}/api/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: createStep,
            title: uploadTitle.trim(),
            description: uploadDescription.trim() || undefined,
            author: uploadAuthor.trim() || undefined,
            body: createStep === "article" ? uploadBody.trim() || undefined : undefined,
            video_url: (createStep === "video" ? uploadVideoUrl.trim() : undefined) || undefined,
            image_url: (createStep === "image" || createStep === "article" ? uploadImageUrl.trim() : undefined) || undefined,
            duration: createStep === "video" ? uploadDuration.trim() || undefined : undefined,
            show_public: uploadShowPublic,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setUploadError(data.error || "Failed to create content");
          return;
        }
        loadContent();
      }
      setUploadOpen(false);
      resetCreateForm();
    } finally {
      setUploadSaving(false);
    }
  }

  function openEdit(sermon: DashboardSermon) {
    setEditingSermon(sermon);
    setEditTitle(sermon.title);
    setEditSpeaker(sermon.speaker);
    setEditSeries(sermon.series);
    setEditDate(sermon.date.slice(0, 10));
    setEditDuration(sermon.duration ?? "");
    setEditDescription(sermon.description ?? "");
    setEditVideoUrl(sermon.videoUrl ?? "");
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSermon) return;
    setEditError("");
    if (!editTitle.trim() || !editSpeaker.trim() || !editSeries.trim() || !editDate.trim()) {
      setEditError("Title, speaker, series, and date are required.");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/sermons/${editingSermon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle.trim(),
          speaker: editSpeaker.trim(),
          series: editSeries.trim(),
          date: editDate.trim(),
          duration: editDuration.trim() || undefined,
          description: editDescription.trim() || undefined,
          video_url: editVideoUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.error || "Failed to update sermon");
        return;
      }
      setSermons((prev) =>
        prev.map((s) =>
          s.id === editingSermon.id
            ? {
                ...s,
                title: editTitle.trim(),
                speaker: editSpeaker.trim(),
                series: editSeries.trim(),
                date: editDate.trim(),
                duration: editDuration.trim(),
                description: editDescription.trim(),
                videoUrl: editVideoUrl.trim() || undefined,
              }
            : s
        )
      );
      setEditingSermon(null);
      setSelectedSermon((prev) => (prev?.id === editingSermon.id ? { ...prev, title: editTitle.trim(), speaker: editSpeaker.trim(), series: editSeries.trim(), date: editDate.trim(), duration: editDuration.trim(), description: editDescription.trim(), videoUrl: editVideoUrl.trim() || undefined } : prev));
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_PATH}/api/sermons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSermons((prev) => prev.filter((s) => s.id !== id));
        setSelectedSermon((prev) => (prev?.id === id ? null : prev));
        setDeleteConfirmId(null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content & Discipleship</h1>
        <button
          type="button"
          onClick={() => { setUploadError(""); setCreateStep("type"); setUploadOpen(true); }}
          className="btn-primary whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Create content
        </button>
      </div>

      {/* Create content modal — step 1: type, step 2: form */}
      <Modal
        open={uploadOpen}
        onClose={() => { if (!uploadSaving) { setUploadOpen(false); resetCreateForm(); } }}
        title={createStep === "type" ? "Create content" : createStep === "sermon" ? "Add sermon" : `Add ${createStep}`}
        wide
      >
        {createStep === "type" ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Choose the type of content to create.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { type: "sermon" as const, label: "Sermon", icon: Play },
                  { type: "video" as const, label: "Video", icon: Video },
                  { type: "article" as const, label: "Article", icon: FileText },
                  { type: "image" as const, label: "Image", icon: ImageIcon },
                ] as const
              ).map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCreateStep(type)}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-6 text-gray-700 transition-colors hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-700"
                >
                  <Icon className="h-8 w-8" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => { setUploadOpen(false); resetCreateForm(); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setCreateStep("type")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to type
            </button>

            {createStep === "sermon" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="input mt-1 w-full" placeholder="e.g. Unshakeable Faith" required />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Speaker *</label>
                    <input type="text" value={uploadSpeaker} onChange={(e) => setUploadSpeaker(e.target.value)} className="input mt-1 w-full" placeholder="e.g. Pastor Name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Series *</label>
                    <input type="text" value={uploadSeries} onChange={(e) => setUploadSeries(e.target.value)} className="input mt-1 w-full" placeholder="e.g. Standing Firm" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} className="input mt-1 w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input type="text" value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} className="input mt-1 w-full" placeholder="e.g. 42 min" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="input mt-1 w-full min-h-[80px]" placeholder="Brief description" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Video URL</label>
                  <input type="url" value={uploadVideoUrl} onChange={(e) => setUploadVideoUrl(e.target.value)} className="input mt-1 w-full" placeholder="YouTube or Vimeo link" />
                </div>
              </>
            )}

            {createStep === "article" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="input mt-1 w-full" placeholder="Article title" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input type="text" value={uploadAuthor} onChange={(e) => setUploadAuthor(e.target.value)} className="input mt-1 w-full" placeholder="Author name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea value={uploadBody} onChange={(e) => setUploadBody(e.target.value)} className="input mt-1 w-full min-h-[120px]" placeholder="Article content" rows={5} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Featured image URL</label>
                  <input type="url" value={uploadImageUrl} onChange={(e) => setUploadImageUrl(e.target.value)} className="input mt-1 w-full" placeholder="Optional image link" />
                </div>
              </>
            )}

            {createStep === "image" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="input mt-1 w-full" placeholder="Image title or caption" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL *</label>
                  <input type="url" value={uploadImageUrl} onChange={(e) => setUploadImageUrl(e.target.value)} className="input mt-1 w-full" placeholder="https://..." required={createStep === "image"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="input mt-1 w-full min-h-[80px]" placeholder="Optional description" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author / credit</label>
                  <input type="text" value={uploadAuthor} onChange={(e) => setUploadAuthor(e.target.value)} className="input mt-1 w-full" placeholder="Optional" />
                </div>
              </>
            )}

            {createStep === "video" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="input mt-1 w-full" placeholder="Video title" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Video URL</label>
                  <input type="url" value={uploadVideoUrl} onChange={(e) => setUploadVideoUrl(e.target.value)} className="input mt-1 w-full" placeholder="YouTube or Vimeo link" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} className="input mt-1 w-full min-h-[80px]" placeholder="Optional" rows={2} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author / speaker</label>
                    <input type="text" value={uploadAuthor} onChange={(e) => setUploadAuthor(e.target.value)} className="input mt-1 w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input type="text" value={uploadDuration} onChange={(e) => setUploadDuration(e.target.value)} className="input mt-1 w-full" placeholder="e.g. 10 min" />
                  </div>
                </div>
              </>
            )}

            {/* Show on public site — for all types */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <input
                id="create-show-public"
                type="checkbox"
                checked={uploadShowPublic}
                onChange={(e) => setUploadShowPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="create-show-public" className="text-sm text-gray-700">
                <Globe className="inline h-4 w-4 mr-1" />
                Publish to main page (show on public site)
              </label>
            </div>

            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={uploadSaving} className="btn-primary">
                {uploadSaving ? "Saving…" : createStep === "sermon" ? "Add sermon" : `Add ${createStep}`}
              </button>
              <button type="button" onClick={() => { setUploadOpen(false); resetCreateForm(); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit sermon modal — higher z-index so it appears above the detail modal */}
      <Modal
        open={!!editingSermon}
        onClose={() => !editSaving && setEditingSermon(null)}
        title="Edit sermon"
        wide
        priority="high"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input mt-1 w-full"
              placeholder="e.g. Unshakeable Faith"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Speaker *</label>
              <input
                type="text"
                value={editSpeaker}
                onChange={(e) => setEditSpeaker(e.target.value)}
                className="input mt-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Series *</label>
              <input
                type="text"
                value={editSeries}
                onChange={(e) => setEditSeries(e.target.value)}
                className="input mt-1 w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="input mt-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="input mt-1 w-full"
                placeholder="e.g. 42 min"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input mt-1 w-full min-h-[80px]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Video URL</label>
            <input
              type="url"
              value={editVideoUrl}
              onChange={(e) => setEditVideoUrl(e.target.value)}
              className="input mt-1 w-full"
              placeholder="e.g. https://youtube.com/watch?v=... or Vimeo link"
            />
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={editSaving} className="btn-primary">
              {editSaving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => !editSaving && setEditingSermon(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading content…</p>
      ) : (
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1 space-y-8">
          {/* Featured / Latest Sermon Hero */}
          {latestSermon && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSermon(latestSermon)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSermon(latestSermon); } }}
              className="card overflow-hidden cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-brand-500/20"
            >
              <div className="relative aspect-video w-full bg-gradient-to-br from-brand-600 via-brand-700 to-slate-800">
                {latestSermon.videoUrl && getVideoEmbedUrl(latestSermon.videoUrl) ? (
                  <iframe
                    src={getVideoEmbedUrl(latestSermon.videoUrl)!}
                    title={latestSermon.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90">
                      <Play className="h-12 w-12" fill="currentColor" />
                      <p className="text-sm">No video linked</p>
                      <p className="text-xs text-white/70">Add a Video URL when adding a sermon to show it here.</p>
                    </div>
                  </>
                )}
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
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
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

          {/* Articles, images & videos */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Articles, images & videos</h2>
            {contentItems.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                No articles, images, or videos yet. Use <strong>Create content</strong> and choose Article, Image, or Video.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contentItems.map((item) => (
                  <div key={item.id} className="card overflow-hidden p-0">
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
                          {item.type === "article" && <FileText className="h-12 w-12" />}
                          {item.type === "image" && <ImageIcon className="h-12 w-12" />}
                          {item.type === "video" && <Video className="h-12 w-12" />}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium capitalize text-white">
                        {item.type}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                      {item.author && <p className="mt-1 text-sm text-gray-600">{item.author}</p>}
                      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                        <input
                          id={`content-show-${item.id}`}
                          type="checkbox"
                          checked={item.showPublic}
                          disabled={contentTogglingId === item.id}
                          onChange={(e) => { e.stopPropagation(); setContentShowPublic(item.id, e.target.checked); }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor={`content-show-${item.id}`} className="flex items-center gap-1 text-xs text-gray-600" onClick={(e) => e.stopPropagation()}>
                          <Globe className="h-3.5 w-3.5" />
                          Show on public site
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reading Plans */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Reading Plans</h2>
            {READING_PLANS.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">
                No reading plans yet. Add plans here when you’re ready.
              </div>
            ) : (
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
            )}
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
              {current.videoUrl && getVideoEmbedUrl(current.videoUrl) ? (
                <iframe
                  src={getVideoEmbedUrl(current.videoUrl)!}
                  title={current.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Play className="h-12 w-12" fill="currentColor" />
                  <p className="text-sm">No video linked for this sermon.</p>
                </div>
              )}
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
              <button
                type="button"
                onClick={() => { setEditingSermon(current); openEdit(current); }}
                className="btn-primary"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              {deleteConfirmId === current.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delete this sermon?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(current.id)}
                    disabled={deletingId === current.id}
                    className="btn-secondary border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    {deletingId === current.id ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={!!deletingId}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(current.id)}
                  className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button type="button" className="btn-secondary">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button type="button" className="btn-ghost">
                <Bookmark className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
