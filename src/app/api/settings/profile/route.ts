import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await query<{
      id: number;
      name: string;
      address: string | null;
      phone: string | null;
      email: string | null;
      service_times: unknown;
      website_url: string | null;
      show_events_public: boolean;
      giving_external_url: string | null;
      text_to_give_phone: string | null;
    }>("SELECT id, name, address, phone, email, service_times, website_url, show_events_public, giving_external_url, text_to_give_phone FROM church_profile WHERE id = 1");
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json({
      name: row.name,
      address: row.address ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      serviceTimes: Array.isArray(row.service_times) ? row.service_times : [],
      websiteUrl: row.website_url ?? "",
      showEventsPublic: row.show_events_public,
      givingExternalUrl: row.giving_external_url ?? "",
      textToGivePhone: row.text_to_give_phone ?? "",
    });
  } catch (e) {
    console.error("[settings/profile GET]", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const name = (body.name ?? "").trim() || "Trinity House";
    const address = (body.address ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const email = (body.email ?? "").trim();
    const serviceTimes = Array.isArray(body.serviceTimes) ? body.serviceTimes : [];
    const websiteUrl = (body.websiteUrl ?? "").trim();
    const showEventsPublic = Boolean(body.showEventsPublic);
    const givingExternalUrl = (body.givingExternalUrl ?? "").trim();
    const textToGivePhone = (body.textToGivePhone ?? "").trim();

    await query(
      `UPDATE church_profile SET
        name = $1, address = $2, phone = $3, email = $4,
        service_times = $5, website_url = $6, show_events_public = $7,
        giving_external_url = $8, text_to_give_phone = $9, updated_at = NOW()
       WHERE id = 1`,
      [name, address || null, phone || null, email || null, JSON.stringify(serviceTimes), websiteUrl || null, showEventsPublic, givingExternalUrl || null, textToGivePhone || null]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[settings/profile POST]", e);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
