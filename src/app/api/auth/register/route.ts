import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Registration creates a pending user; superuser must approve before they can sign in. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const { rows: existing } = await query<{ id: number }>(
      "SELECT id FROM app_users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await query(
      "INSERT INTO app_users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)",
      [email, password_hash, "user", "pending"]
    );

    return NextResponse.json({
      ok: true,
      message: "Registration submitted. You'll be able to sign in once an administrator approves your account.",
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
