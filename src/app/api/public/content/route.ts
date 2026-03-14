import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  author: string | null;
  body: string | null;
  video_url: string | null;
  image_url: string | null;
  duration: string | null;
  created_at: string;
};

/** GET: Public list of content (articles, images, videos) where show_public = true. */
export async function GET() {
  try {
    const result = await query<Row>(
      `SELECT id, type, title, description, author, body, video_url, image_url, duration, created_at::text
       FROM content
       WHERE show_public = true
       ORDER BY created_at DESC`
    );
    const items = result.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description ?? "",
      author: r.author ?? "",
      body: r.body ?? "",
      videoUrl: r.video_url ?? undefined,
      imageUrl: r.image_url ?? undefined,
      duration: r.duration ?? "",
      createdAt: r.created_at,
    }));
    return NextResponse.json({ content: items });
  } catch (e) {
    console.error("[public/content GET]", e);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
