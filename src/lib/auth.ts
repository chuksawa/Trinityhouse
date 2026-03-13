import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "trinityhouse_session";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/trinityhouse";
/** Use JWT_SECRET or SESSION_SECRET; must be set in production. */
const SECRET = new TextEncoder().encode(
  (process.env.JWT_SECRET || process.env.SESSION_SECRET || "trinityhouse-dev-secret-change-in-production").slice(0, 32).padEnd(32, "0")
);

export type SessionPayload = { email: string; role: string };

export function getCookiePath() {
  return BASE_PATH;
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.email && payload.role) {
      return { email: String(payload.email), role: String(payload.role) };
    }
    return null;
  } catch {
    return null;
  }
}
