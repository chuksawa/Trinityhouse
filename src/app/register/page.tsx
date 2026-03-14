"use client";

import { Church, User, Users } from "lucide-react";
import Link from "next/link";
import { SiteFooterMinimal } from "@/components/site-footer";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type RegistrationType = "member" | "staff";

export default function RegisterPage() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<RegistrationType>("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          registrationType,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      if (data.approved) {
        router.push(`${BASE_PATH}/dashboard/`);
        router.refresh();
        return;
      }
      setSuccessMessage(data.message || "Registration submitted. You'll be able to sign in once an administrator approves your staff account.");
      setLoading(false);
    } catch {
      setError("Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-950 p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <Link href="/home" className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Church className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white">Trinity House</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Join the family.
            <br />
            Create your account.
          </h2>
          <p className="max-w-md text-lg text-brand-200/80">
            Get access to the dashboard — people, groups, events, and more —
            all in one place.
          </p>
          <div className="flex gap-4 pt-2">
            {[
              { n: "—", l: "Members" },
              { n: "—", l: "Groups" },
              { n: "—", l: "Avg Attendance" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/5 px-5 py-3 backdrop-blur">
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-brand-300">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-brand-300/60">
          &copy; {new Date().getFullYear()} Trinity House Church
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-between gap-3 mb-4">
            <Link href="/home" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Church className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Trinity House</span>
            </Link>
            <Link href="/home" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Back to home
            </Link>
          </div>
          <div className="hidden lg:block">
            <Link href="/home" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Choose how you&apos;re joining, then enter your details.
            </p>
          </div>

          {successMessage ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800">
                {successMessage}
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`${BASE_PATH}/login/`}
                  className="btn-primary w-full text-center"
                >
                  Go to Sign in
                </Link>
                <Link
                  href="/home"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">I am registering as</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegistrationType("member")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-colors ${
                    registrationType === "member"
                      ? "border-brand-600 bg-brand-50 text-brand-900"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-6 w-6" />
                  <span className="font-semibold">Member</span>
                  <span className="text-xs opacity-90">I attend or am part of the church family. Instant access.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegistrationType("staff")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-colors ${
                    registrationType === "staff"
                      ? "border-brand-600 bg-brand-50 text-brand-900"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <User className="h-6 w-6" />
                  <span className="font-semibold">Staff</span>
                  <span className="text-xs opacity-90">I serve on staff or in ministry. Approval required.</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Submitting…" : registrationType === "member" ? "Create account" : "Request staff account"}
            </button>
          </form>
          )}

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href={`${BASE_PATH}/login/`} className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>
      <SiteFooterMinimal />
    </div>
  );
}
