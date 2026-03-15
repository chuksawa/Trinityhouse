import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const RESET_TOKEN = "temp-reset-8f3a2c9d7e";

/** Temporary one-time endpoint to fix the superuser password. Remove after use. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.token !== RESET_TOKEN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 12);
    const { rowCount } = await query(
      "UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE email = $2",
      [hash, email]
    );
    if (rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "Password updated" });
  } catch (e) {
    console.error("[reset-su]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
