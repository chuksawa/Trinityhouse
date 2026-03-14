import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
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
  show_public: boolean;
  created_at: string;
};

/** GET: List all content (articles, images, videos) for dashboard. Auth required. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await query<Row>(
      `SELECT id, type, title, description, author, body, video_url, image_url, duration, show_public, created_at::text
       FROM content ORDER BY created_at DESC`
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
      showPublic: r.show_public,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ content: items });
  } catch (e) {
    console.error("[content GET]", e);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

/** POST: Create a new content item (article, image, or video). Auth required. */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const type = (body.type ?? "").toString().trim().toLowerCase();
    if (!["article", "image", "video"].includes(type)) {
      return NextResponse.json({ error: "type must be article, image, or video" }, { status: 400 });
    }
    const title = (body.title ?? "").toString().trim();
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const description = (body.description ?? "").toString().trim() || null;
    const author = (body.author ?? "").toString().trim() || null;
    const bodyText = (body.body ?? "").toString().trim() || null;
    const videoUrl = (body.video_url ?? "").toString().trim() || null;
    const imageUrl = (body.image_url ?? "").toString().trim() || null;
    const duration = (body.duration ?? "").toString().trim() || null;
    const showPublic = typeof body.show_public === "boolean" ? body.show_public : true;

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO content (id, type, title, description, author, body, video_url, image_url, duration, show_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, type, title, description, author, bodyText, videoUrl, imageUrl, duration, showPublic]
    );
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[content POST]", e);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}
