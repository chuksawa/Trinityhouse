import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query, getClient } from "@/lib/db";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY?.trim();

export async function POST(req: Request) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json(
      { error: "Paystack is not configured." },
      { status: 503 }
    );
  }

  try {
    const { reference, fund } = await req.json();
    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not verified" },
        { status: 400 }
      );
    }

    const txn = verifyData.data;
    const amountKobo = txn.amount; // Paystack returns amount in kobo
    const amountNaira = amountKobo / 100;
    const giftFund = fund || "offering";

    // Look up person by email if logged in
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

    // Record gift
    const date = new Date().toISOString().slice(0, 10);
    const giftId = `gpstk_${txn.reference.slice(0, 22)}`;
    const client = await getClient();
    try {
      await client.query(
        `INSERT INTO gifts (id, person_id, amount, date, fund, method, recurring)
         VALUES ($1, $2, $3, $4::date, $5, 'online', false)
         ON CONFLICT (id) DO NOTHING`,
        [giftId, personId, amountNaira, date, giftFund]
      );
      if (personId) {
        await client.query(
          `UPDATE people SET giving_total = COALESCE(giving_total, 0) + $1, updated_at = NOW() WHERE id = $2`,
          [amountNaira, personId]
        );
      }
    } finally {
      client.release();
    }

    return NextResponse.json({ verified: true, amount: amountNaira });
  } catch (e) {
    console.error("[giving/paystack-verify]", e);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
