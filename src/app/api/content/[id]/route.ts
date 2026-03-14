import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH: Update content item. Auth required. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const str = (v: unknown) => (typeof v === "string" ? v.trim() || null : null);
    if (body.title !== undefined) { updates.push(`title = $${idx++}`); values.push(str(body.title) ?? ""); }
    if (body.description !== undefined) { updates.push(`description = $${idx++}`); values.push(str(body.description)); }
    if (body.author !== undefined) { updates.push(`author = $${idx++}`); values.push(str(body.author)); }
    if (body.body !== undefined) { updates.push(`body = $${idx++}`); values.push(str(body.body)); }
    if (body.video_url !== undefined) { updates.push(`video_url = $${idx++}`); values.push(str(body.video_url)); }
    if (body.image_url !== undefined) { updates.push(`image_url = $${idx++}`); values.push(str(body.image_url)); }
    if (body.duration !== undefined) { updates.push(`duration = $${idx++}`); values.push(str(body.duration)); }
    if (typeof body.show_public === "boolean") { updates.push(`show_public = $${idx++}`); values.push(body.show_public); }

    if (updates.length === 0) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

    values.push(id);
    await query(`UPDATE content SET ${updates.join(", ")} WHERE id = $${idx}`, values);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[content PATCH]", e);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

/** DELETE: Remove content item. Auth required. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await query("DELETE FROM content WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[content DELETE]", e);
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
