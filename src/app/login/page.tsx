"use client";

import { Church } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen">
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
            One place to shepherd,
            <br />
            connect, and grow.
          </h2>
          <p className="max-w-md text-lg text-brand-200/80">
            People, groups, giving, events, and discipleship — all in one hub
            built for your church.
          </p>
          <div className="flex gap-4 pt-2">
            {[
              { n: "324", l: "Members" },
              { n: "6", l: "Groups" },
              { n: "342", l: "Avg Attendance" },
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="david@trinityhouse.org"
                className="input"
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
                placeholder="••••••••"
                className="input"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                Remember me
              </label>
              <Link href="/home" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>
            <Link href="/dashboard" className="btn-primary w-full text-center block">
              Sign In
            </Link>
          </form>

          <p className="text-center text-sm text-gray-500">
            New to Trinity House?{" "}
            <Link href="/home#visit" className="font-medium text-brand-600 hover:text-brand-700">
              Plan a visit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
