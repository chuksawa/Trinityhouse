"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/public-header";
import { Heart, ExternalLink } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";

const FUND_OPTIONS: { value: string; label: string }[] = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "missions", label: "Missions" },
  { value: "building_fund", label: "Building Fund" },
  { value: "benevolence", label: "Benevolence" },
];

const PRESET_AMOUNTS_NGN = [1000, 2000, 5000, 10000, 20000, 50000];

const CURRENCY = { code: "ngn", symbol: "₦", name: "Nigerian Naira" } as const;
const MIN_AMOUNT_NGN = 500;

// Nigeria default: Country = Nigeria, so no US/ZIP and phone format is appropriate
const PAYMENT_ELEMENT_OPTIONS = {
  defaultValues: {
    billingDetails: {
      address: {
        country: "NG",
      },
    },
  },
  layout: { type: "tabs" as const, defaultCollapsed: false },
};

function PaymentForm({
  clientSecret,
  amountLabel,
  onCancel,
}: {
  clientSecret: string;
  amountLabel: string;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError("");
    setLoading(true);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== "undefined" ? window.location.origin : ""}${BASE_PATH}/give?success=1`,
          payment_method_data: {
            billing_details: {
              address: { country: "NG" },
            },
          },
        },
      });
      if (confirmError) {
        setError(confirmError.message || "Payment failed");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-600">
        You're giving <strong>{amountLabel}</strong>. Card and billing details below — <strong>Country is set to Nigeria</strong>.
      </p>
      <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Back
        </button>
        <button type="submit" disabled={!stripe || loading} className="btn-primary flex-1">
          {loading ? "Processing…" : "Pay now"}
        </button>
      </div>
    </form>
  );
}

export default function GivePage() {
  const [config, setConfig] = useState<{
    givingExternalUrl: string;
    textToGivePhone: string;
  }>({ givingExternalUrl: "", textToGivePhone: "" });
  const [amount, setAmount] = useState("");
  const [fund, setFund] = useState("offering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise] = useState(() => (PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null));

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/giving/config`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled)
          setConfig({
            givingExternalUrl: data.givingExternalUrl ?? "",
            textToGivePhone: data.textToGivePhone ?? "",
          });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    setSuccess(params.get("success") === "1");
    setCanceled(params.get("canceled") === "1");
  }, []);

  async function handleContinueToPay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    const amountSmallestUnit = Math.round(value * 100);
    if (amountSmallestUnit < 50000) {
      setError(`Minimum amount is ${CURRENCY.symbol}${MIN_AMOUNT_NGN.toLocaleString()}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/giving/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amountCents: amountSmallestUnit, fund, currency: CURRENCY.code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not start payment");
        setLoading(false);
        return;
      }
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError("No payment session returned");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  const amountLabel = amount ? `${CURRENCY.symbol}${Number(amount.replace(/[^0-9.]/g, "") || 0).toLocaleString()} — ${fund.replace(/_/g, " ")}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="card p-6 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Give with a grateful heart
          </h1>
          <p className="mt-3 text-center text-gray-600">
            Your generosity fuels our mission — local outreach, global missions, and caring for our community.
          </p>

          {success && (
            <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800">
              Thank you! Your gift has been received.
            </div>
          )}
          {canceled && (
            <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              Checkout was canceled. You can try again below.
            </div>
          )}

          {!success && !clientSecret && (
            <>
              <form onSubmit={handleContinueToPay} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ({CURRENCY.symbol} {CURRENCY.name})</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESET_AMOUNTS_NGN.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAmount(String(n))}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                          amount === String(n)
                            ? "border-brand-600 bg-brand-50 text-brand-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {CURRENCY.symbol}{n.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Other amount"
                    className="input mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fund</label>
                  <select
                    value={fund}
                    onChange={(e) => setFund(e.target.value)}
                    className="input mt-1 w-full"
                  >
                    {FUND_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading || !PUBLISHABLE_KEY} className="btn-primary w-full">
                  {loading ? "Loading…" : "Continue to pay (card)"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500">
                Pay with <strong>card</strong>. Country and phone will default to <strong>Nigeria</strong>. You can also give via direct bank transfer — contact the church office for account details.
              </p>
            </>
          )}

          {!success && clientSecret && stripePromise && (
            <div className="mt-8">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe", variables: { borderRadius: "8px" } },
                }}
              >
                <PaymentForm
                  clientSecret={clientSecret}
                  amountLabel={amountLabel}
                  onCancel={() => setClientSecret(null)}
                />
              </Elements>
            </div>
          )}

          {!PUBLISHABLE_KEY && !clientSecret && (
            <p className="mt-4 text-sm text-amber-700">
              In-app card payment is not configured (missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY). Use the external link below if available.
            </p>
          )}

          {config.givingExternalUrl && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-600">Prefer to give through our payment partner?</p>
              <a
                href={config.givingExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <ExternalLink className="h-5 w-5" />
                Give externally
              </a>
            </div>
          )}

          {config.textToGivePhone && (
            <p className="mt-6 text-center text-sm text-gray-500">
              or text <strong>GIVE</strong> to {config.textToGivePhone}
            </p>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            Card payments are processed securely. You can also{" "}
            <Link href="/login" className="text-brand-600 hover:underline">sign in</Link> so your giving is linked to your profile.
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/home" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
