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
    const amountCents = Math.round(Number(body.amountCents) || 0);
    const fund = FUNDS.includes(body.fund) ? body.fund : "offering";
    const currency = (body.currency || "ngn").toString().toLowerCase().slice(0, 3);

    const isNgn = currency === "ngn";
    // Stripe Nigerian payment methods require 500–100,000,000 NGN (50000 kobo min)
    const minAmount = isNgn ? 50000 : 100; // NGN: 50000 kobo = ₦500; USD: 100 cents = $1
    if (amountCents < minAmount) {
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
    const baseUrl = origin.replace(/\/$/, "") || `https://www.9logiclabs.com`;
    const path = BASE_PATH.replace(/^\//, "") ? `/${BASE_PATH.replace(/^\//, "")}` : "";
    const successUrl = `${baseUrl}${path}/give?success=1`;
    const cancelUrl = `${baseUrl}${path}/give?canceled=1`;

    const lineItems = [
      {
        price_data: {
          currency,
          unit_amount: amountCents,
          product_data: {
            name: `Donation — ${fund.replace(/_/g, " ")}`,
            description: "Trinity House giving",
          },
        },
        quantity: 1 as const,
      },
    ];

    const baseParams = {
      mode: "payment" as const,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { fund, person_id: personId ?? "" },
      branding_settings: { display_name: "Trinity House" },
    };

    // Try with Nigerian payment methods first; fall back to card-only if Stripe rejects (e.g. not enabled on account)
    const paymentMethodOptions = isNgn
      ? (["card", "ng_card", "ng_bank_transfer"] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[])
      : (["card"] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[]);

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        payment_method_types: paymentMethodOptions,
        ...(isNgn && { locale: "en-NG" as Stripe.Checkout.SessionCreateParams.Locale }),
      });
    } catch (firstErr: unknown) {
      const isStripeErr = firstErr && typeof firstErr === "object" && "type" in firstErr;
      if (isNgn && isStripeErr && paymentMethodOptions.length > 1) {
        try {
          session = await stripe.checkout.sessions.create({
            ...baseParams,
            payment_method_types: ["card"],
            ...(isNgn && { locale: "en-NG" as Stripe.Checkout.SessionCreateParams.Locale }),
          });
        } catch (fallbackErr) {
          console.error("[giving/checkout-session] fallback failed", fallbackErr);
          return NextResponse.json(
            { error: "Could not start checkout. Please try again or use another payment option." },
            { status: 500 }
          );
        }
      } else {
        throw firstErr;
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[giving/checkout-session]", e);
    const message = e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
      ? (e as { message: string }).message
      : "Could not start checkout";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
