import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getClient } from "@/lib/db";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY?.trim();

export const dynamic = "force-dynamic";

/** Paystack sends charge.success when a payment succeeds. We record the gift here so it shows on the dashboard even if the client never called verify. */
export async function POST(req: Request) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  const hash = createHmac("sha512", PAYSTACK_SECRET).update(raw).digest("hex");
  try {
    if (hash.length !== signature.length || !timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; metadata?: { fund?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const ref = event.data.reference;
  const amountKobo = event.data.amount ?? 0;
  const amountNaira = amountKobo / 100;
  const fund = (event.data.metadata?.fund as string) || "offering";

  if (amountNaira <= 0) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const giftId = `gpstk_${ref.slice(0, 22)}`;

  try {
    const client = await getClient();
    try {
      await client.query(
        `INSERT INTO gifts (id, person_id, amount, date, fund, method, recurring)
         VALUES ($1, $2, $3, $4::date, $5, 'online', false)
         ON CONFLICT (id) DO NOTHING`,
        [giftId, null, amountNaira, date, fund]
      );
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("[giving/paystack-webhook] Insert failed:", e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
