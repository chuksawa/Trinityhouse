import { NextResponse } from "next/server";
import Stripe from "stripe";
import { query, getClient } from "@/lib/db";

const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
const webhookSecret = process.env.STRIPE_GIVING_WEBHOOK_SECRET?.trim();
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: true }, { status: 200 });
  }
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json("Missing stripe-signature", { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error("[giving/webhook] Signature verification failed:", err);
    return NextResponse.json("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const amountTotal = session.amount_total ?? 0;
  const fund = (session.metadata?.fund as string) || "offering";
  const personId = (session.metadata?.person_id as string) || null;

  if (amountTotal <= 0) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const amount = amountTotal / 100;
    const date = new Date().toISOString().slice(0, 10);
    const giftId = `gstripe_${session.id.replace(/^cs_/, "").slice(0, 20)}`;

    const client = await getClient();
    try {
      await client.query(
        `INSERT INTO gifts (id, person_id, amount, date, fund, method, recurring)
         VALUES ($1, $2, $3, $4::date, $5, 'online', false)
         ON CONFLICT (id) DO NOTHING`,
        [giftId, personId || null, amount, date, fund]
      );
      if (personId) {
        await client.query(
          `UPDATE people SET giving_total = COALESCE(giving_total, 0) + $1, updated_at = NOW() WHERE id = $2`,
          [amount, personId]
        );
      }
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("[giving/webhook] Insert failed:", e);
    return NextResponse.json("Processing failed", { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
