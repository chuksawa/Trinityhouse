import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH: Update sermon (show_public or full fields). Auth required. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));

    // Full edit: title, speaker, series, date, duration, description, video_url
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const speaker = typeof body.speaker === "string" ? body.speaker.trim() : null;
    const series = typeof body.series === "string" ? body.series.trim() : null;
    const dateStr = typeof body.date === "string" ? body.date.trim() : null;
    const duration = body.duration !== undefined ? (typeof body.duration === "string" ? body.duration.trim() || null : null) : null;
    const description = body.description !== undefined ? (typeof body.description === "string" ? body.description.trim() || null : null) : null;
    const videoUrl = body.video_url !== undefined ? (typeof body.video_url === "string" ? body.video_url.trim() || null : null) : null;
    const showPublic = typeof body.showPublic === "boolean" ? body.showPublic : null;

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (title !== null) { updates.push(`title = $${idx++}`); values.push(title); }
    if (speaker !== null) { updates.push(`speaker = $${idx++}`); values.push(speaker); }
    if (series !== null) { updates.push(`series = $${idx++}`); values.push(series); }
    if (dateStr !== null) {
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        updates.push(`date = $${idx++}::date`); values.push(date.toISOString().slice(0, 10));
      }
    }
    if (duration !== undefined) { updates.push(`duration = $${idx++}`); values.push(duration); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (videoUrl !== undefined) { updates.push(`video_url = $${idx++}`); values.push(videoUrl); }
    if (showPublic !== null) { updates.push(`show_public = $${idx++}`); values.push(showPublic); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(id);
    const setClause = updates.join(", ");
    let sql = `UPDATE sermons SET ${setClause} WHERE id = $${idx}`;

    try {
      await query(sql, values);
      return NextResponse.json({ ok: true });
    } catch (colErr: unknown) {
      const m = colErr instanceof Error ? colErr.message : String(colErr);
      if (m.includes("video_url") || m.includes("does not exist")) {
        const videoIdx = updates.findIndex((u) => u.startsWith("video_url"));
        if (videoIdx >= 0) {
          const keptUpdates = updates.filter((_, i) => i !== videoIdx);
          const keptValues = values.slice(0, -1).filter((_, i) => i !== videoIdx);
          if (keptUpdates.length > 0) {
            const setClause = keptUpdates.map((u, i) => u.replace(/=\s*\$\d+/, `= $${i + 1}`)).join(", ");
            await query(`UPDATE sermons SET ${setClause} WHERE id = $${keptUpdates.length + 1}`, [...keptValues, id]);
          }
          return NextResponse.json({ ok: true });
        }
      }
      throw colErr;
    }
  } catch (e) {
    console.error("[sermons PATCH]", e);
    return NextResponse.json({ error: "Failed to update sermon" }, { status: 500 });
  }
}

/** DELETE: Remove a sermon. Auth required. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await query("DELETE FROM sermons WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sermons DELETE]", e);
    return NextResponse.json({ error: "Failed to delete sermon" }, { status: 500 });
  }
}
