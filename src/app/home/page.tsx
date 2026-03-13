import Link from "next/link";
import {
  Church,
  MapPin,
  Clock,
  Heart,
  Users,
  Play,
  ArrowRight,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { sermons } from "@/lib/data";
import PublicEventsBlock from "@/components/public-events-block";
import PublicHeader from "@/components/public-header";
import { SiteFooterCredit } from "@/components/site-footer";

const SERVICE_TIMES = [
  { day: "Sunday", times: "9:00 AM & 11:00 AM", label: "Worship" },
  { day: "Wednesday", times: "7:00 PM", label: "Midweek" },
];

const ADDRESS = "Zion Centre, Trinity Avenue, Water Corporation Road, Off Ligali Ayorinde Street, Victoria Island, Lagos";
const PHONE = "(555) 100-0000";
const EMAIL = "hello@trinityhouse.org";

export default function HomePage() {
  const latestSermon = sermons[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Hero — pastor at podium with overlay */}
      <section className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <img
          src="/trinityhouse/pastor-hero.png"
          alt="Trinity House — teaching and worship"
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-900/75 to-brand-950/50" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-brand-950 to-transparent" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 py-16 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Welcome home
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            One church.
            <br />
            One family.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-100">
            Whether you&apos;re new here, part of our congregation, or on staff — you belong. Connect, grow, and serve with us.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/home#visit"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
            >
              I&apos;m New Here
            </Link>
            {/* Sign In to the App — hidden for now, resurrect when needed */}
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-6 py-3.5 text-base font-semibold text-white/90 backdrop-blur transition-all hover:bg-white/15"
            >
              Create account
            </Link>
            <Link
              href="/home#give"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400/60 bg-emerald-500/20 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-emerald-500/30"
            >
              <Heart className="h-5 w-5" />
              Give
            </Link>
          </div>
          <p
            className="relative mt-8 w-full max-w-6xl px-4 pr-[calc(1rem+225px)] text-right text-xl font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
            style={{ textShadow: "0 0 24px rgba(180,160,120,0.4)" }}
          >
            <span className="pastor-name-reveal relative inline-block text-brand-200/40">
              Pastor Ituah Ighodalo
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden
              >
                <span
                  className="pastor-name-shimmer absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.18)_50%,transparent_100%)]"
                  style={{ left: "-6rem" }}
                />
              </span>
              <span
                className="pastor-name-flash pointer-events-none absolute inset-0 flex items-center justify-end text-brand-100/90"
                aria-hidden
              >
                Pastor Ituah Ighodalo
              </span>
            </span>
          </p>
        </div>
      </section>

      {/* Plan your visit (visitors) */}
      <section id="visit" className="scroll-mt-20 border-b border-gray-200 bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Plan Your Visit
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              We&apos;d love to meet you. Here&apos;s what to expect.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Service Times</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {SERVICE_TIMES.map((s) => (
                  <li key={s.day}>
                    <span className="font-medium text-gray-800">{s.day}</span>: {s.times} — {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Location</h3>
              <p className="mt-3 text-sm text-gray-600">{ADDRESS}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Get directions <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="card p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">What to Expect</h3>
              <p className="mt-3 text-sm text-gray-600">
                Casual dress, friendly faces, and a place for everyone. Kids and youth programs available. Come as you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where we gather — dim background image */}
      <section className="relative overflow-hidden bg-slate-700">
        <div className="absolute inset-0">
          <img
            src="/trinityhouse/hero-location.png"
            alt="Trinity House — a place to belong"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-brand-900/50" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:py-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            A place to belong
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Every weekend we gather — to worship, connect, and grow. You&apos;re invited.
          </p>
          <Link
            href="/home#events"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 transition-all hover:bg-brand-50"
          >
            See what&apos;s on <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Events & Weekends — public, from dashboard-managed list */}
      <PublicEventsBlock />

      {/* Watch / Latest sermon (congregation + visitors) */}
      <section id="watch" className="scroll-mt-20 border-y border-gray-200 bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Watch & Grow
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Latest teaching and full sermon archive.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl">
                <div className="relative aspect-video flex items-center justify-center bg-brand-900/50">
                  <button
                    type="button"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform hover:scale-105"
                  >
                    <Play className="h-10 w-10 ml-1" fill="currentColor" />
                  </button>
                </div>
                <div className="p-6">
                  <span className="badge badge-purple">{latestSermon.series}</span>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    {latestSermon.title}
                  </h3>
                  <p className="mt-1 text-brand-200">
                    {latestSermon.speaker} · {latestSermon.date}
                  </p>
                  <p className="mt-2 text-sm text-brand-100">
                    {latestSermon.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-brand-200">
                    <span>{latestSermon.duration}</span>
                    <span>{latestSermon.views} views</span>
                  </div>
                </div>
              </div>
              <Link
                href="/watch"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Browse sermon archive <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex w-full flex-col gap-4 lg:w-80">
              <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
              <Link
                href="/login"
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Give Online</p>
                  <p className="text-sm text-gray-500">Secure giving in the app</p>
                </div>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Find a Group</p>
                  <p className="text-sm text-gray-500">Connect with others</p>
                </div>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/50 p-4 transition-colors hover:bg-brand-100/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Church className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Staff & Volunteers</p>
                  <p className="text-sm text-gray-500">Open church hub</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Give (congregation) */}
      <section id="give" className="scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="card p-8 sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              Give with a grateful heart
            </h2>
            <p className="mt-3 text-gray-600">
              Your generosity fuels our mission — local outreach, global missions, and caring for our community. Give one-time or set up recurring giving in the app.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="btn-primary">
                Give in the App
              </Link>
              <span className="text-sm text-gray-500">or text GIVE to (555) 100-0000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Church className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">Trinity House</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white/90">Visit</p>
                <p className="mt-2 text-sm text-slate-300">{ADDRESS}</p>
              </div>
              <div>
                <p className="font-semibold text-white/90">Contact</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4" /> {PHONE}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4" /> {EMAIL}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/90">Quick links</p>
                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-300">
                  <Link href="/home#visit" className="hover:text-white">Plan a visit</Link>
                  <Link href="/home#events" className="hover:text-white">Events</Link>
                  <Link href="/login" className="hover:text-white">Sign In</Link>
                  <Link href="/dashboard" className="hover:text-white">Staff hub</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            <SiteFooterCredit />
          </div>
        </div>
      </footer>
    </div>
  );
}
