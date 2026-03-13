import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/trinityhouse";
const COOKIE_NAME = "trinityhouse_session";

function getSecret() {
  const s = (process.env.JWT_SECRET || process.env.SESSION_SECRET || "trinityhouse-dev-secret-change-in-production").slice(0, 32).padEnd(32, "0");
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isDashboard = pathname === BASE_PATH + "/dashboard" || pathname.startsWith(BASE_PATH + "/dashboard/");
  if (!isDashboard) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL(BASE_PATH + "/login/", req.url);
    return NextResponse.redirect(login);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    const login = new URL(BASE_PATH + "/login/", req.url);
    const res = NextResponse.redirect(login);
    res.cookies.set(COOKIE_NAME, "", { path: BASE_PATH, maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/trinityhouse/dashboard", "/trinityhouse/dashboard/:path*"],
};
