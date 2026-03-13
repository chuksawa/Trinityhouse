import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH: Update sermon (e.g. show_public). Auth required. */
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
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (typeof body.showPublic === "boolean") {
      try {
        await query(
          "UPDATE sermons SET show_public = $1, created_at = created_at WHERE id = $2",
          [body.showPublic, id]
        );
        return NextResponse.json({ ok: true });
      } catch (colErr: unknown) {
        const m = colErr instanceof Error ? colErr.message : String(colErr);
        if (m.includes("show_public") || m.includes("does not exist")) {
          return NextResponse.json({ error: "show_public column not available. Run migration 010." }, { status: 400 });
        }
        throw colErr;
      }
    }

    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  } catch (e) {
    console.error("[sermons PATCH]", e);
    return NextResponse.json({ error: "Failed to update sermon" }, { status: 500 });
  }
}
