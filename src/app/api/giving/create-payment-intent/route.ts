import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/trinityhouse";
const FUNDS = ["tithe", "offering", "missions", "building_fund", "benevolence"] as const;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Giving is not configured. Please set STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json();
    const amountSmallest = Math.round(Number(body.amountCents) || 0);
    const fund = FUNDS.includes(body.fund) ? body.fund : "offering";
    const currency = (body.currency || "ngn").toString().toLowerCase().slice(0, 3);

    const isNgn = currency === "ngn";
    const minAmount = isNgn ? 50000 : 100; // NGN: 50000 kobo = ₦500
    if (amountSmallest < minAmount) {
      return NextResponse.json(
        { error: isNgn ? "Minimum amount is ₦500" : "Minimum amount is 1.00" },
        { status: 400 }
      );
    }

    let personId: string | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (payload?.email) {
      const { rows } = await query<{ id: string }>(
        "SELECT id FROM people WHERE LOWER(email) = $1 LIMIT 1",
        [payload.email.toLowerCase()]
      );
      personId = rows[0]?.id ?? null;
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const baseUrl = origin.replace(/\/$/, "") || "https://www.9logiclabs.com";
    const path = BASE_PATH.replace(/^\//, "") ? `/${BASE_PATH.replace(/^\//, "")}` : "";
    const returnUrl = `${baseUrl}${path}/give`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountSmallest,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { fund, person_id: personId ?? "" },
      return_url: `${returnUrl}?success=1`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("[giving/create-payment-intent]", e);
    const message =
      e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
        ? (e as { message: string }).message
        : "Could not create payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
