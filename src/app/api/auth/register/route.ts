import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createToken, getCookieName, getCookiePath } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Registration: member = active + session; staff = pending (approval required). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const registrationType = (body.registrationType ?? "member").toString().toLowerCase();
    const isStaff = registrationType === "staff";

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

    if (registrationType !== "member" && registrationType !== "staff") {
      return NextResponse.json({ error: "Please choose Member or Staff" }, { status: 400 });
    }

    const { rows: existing } = await query<{ id: number }>(
      "SELECT id FROM app_users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const status = isStaff ? "pending" : "active";

    try {
      await query(
        "INSERT INTO app_users (email, password_hash, role, status, registration_type) VALUES ($1, $2, $3, $4, $5)",
        [email, password_hash, "user", status, isStaff ? "staff" : "member"]
      );
    } catch (err) {
      await query(
        "INSERT INTO app_users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)",
        [email, password_hash, "user", status]
      );
    }

    if (isStaff) {
      return NextResponse.json({
        ok: true,
        approved: false,
        message: "Registration submitted. You'll be able to sign in once an administrator approves your staff account.",
      });
    }

    const token = await createToken({ email, role: "user" });
    const res = NextResponse.json({ ok: true, approved: true });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: getCookiePath(),
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
