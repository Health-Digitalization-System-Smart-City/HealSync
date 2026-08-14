import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartHandshake,
  HeartPulse,
  LogIn,
  MessageSquareHeart,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Timer,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Phone,
    step: "1",
    title: "Enter your phone number",
    description:
      "So our team can reach you if they need to follow up about your visit.",
  },
  {
    icon: Building2,
    step: "2",
    title: "Choose your branch",
    description: "Select the HealSync clinic location you visited.",
  },
  {
    icon: Stethoscope,
    step: "3",
    title: "Select the service",
    description: "Reception, pharmacy, laboratory, billing, and more.",
  },
  {
    icon: Star,
    step: "4",
    title: "Rate your visit",
    description: "Tap a rating and share your thoughts in your own words.",
  },
];

const reasons = [
  {
    icon: HeartHandshake,
    title: "Care that listens",
    description:
      "Your feedback goes straight to the clinic team and helps us improve service, comfort, and attention to detail.",
  },
  {
    icon: Timer,
    title: "Quick and easy",
    description:
      "Fits between appointments. No downloads, no accounts, no waiting.",
  },
  {
    icon: ShieldCheck,
    title: "Private and confidential",
    description:
      "Your responses are handled securely and used only to improve the care we provide.",
  },
];

const assurances = [
  "Takes about a minute",
  "No app or account needed",
  "Private & confidential",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-emerald-700 uppercase shadow-sm">
      {children}
    </span>
  );
}

function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]"
    >
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[3.5rem] bg-gradient-to-br from-emerald-200/60 via-teal-100/40 to-sky-200/50 blur-2xl"
      />
      <div className="animate-float relative rounded-[2.75rem] border border-emerald-100 bg-white p-2.5 shadow-2xl shadow-emerald-900/15">
        <div
          aria-hidden
          className="mx-auto mb-2.5 h-6 w-24 rounded-full bg-neutral-100"
        />
        <div className="rounded-[2rem] border border-emerald-100/80 bg-gradient-to-b from-emerald-50/70 to-white px-5 pt-5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <HeartPulse className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-bold text-neutral-800">
                HealSync
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Feedback
            </span>
          </div>

          <div
            aria-hidden
            className="mt-5 flex items-center justify-center gap-1.5"
          >
            {[true, true, true, false].map((active, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full",
                  active ? "w-6 bg-emerald-500" : "w-4 bg-emerald-200",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-neutral-500">
            Step 4 of 4 · Rating
          </p>

          <h3 className="mt-2 text-center text-sm font-bold text-neutral-900">
            How was your experience?
          </h3>

          <div
            aria-hidden
            className="mt-3 flex items-center justify-center gap-1.5"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-6 w-6",
                  i < 4 ? "fill-amber-400 text-amber-400" : "text-neutral-300",
                )}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-[11px] text-neutral-400 shadow-sm">
            Tell us more about your visit…
          </div>

          <div className="mt-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-emerald-500/25">
            Submit feedback
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="animate-float-slow absolute top-16 -left-12 hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-white/90 px-3.5 py-2.5 shadow-xl shadow-emerald-900/10 backdrop-blur sm:flex"
      >
        <CheckCircle2 className="size-5 text-emerald-500" />
        <div>
          <p className="text-xs font-semibold text-neutral-800">
            Feedback received
          </p>
          <p className="text-[10px] text-neutral-500">Thank you!</p>
        </div>
      </div>
      <div
        aria-hidden
        className="animate-float-slow absolute -right-10 bottom-14 hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-white/90 px-3.5 py-2.5 shadow-xl shadow-emerald-900/10 backdrop-blur [animation-delay:1.5s] sm:flex"
      >
        <HeartHandshake className="size-5 text-rose-500" />
        <p className="text-xs font-semibold text-neutral-800">
          Helps our whole team
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-white text-neutral-900">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">HealSync</span>
          </Link>

<<<<<<< HEAD
        <div className="flex flex-col items-start gap-4">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            <HeartPulse className="text-primary size-10" aria-hidden />
            HealSync
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-8">
            A feedback platform for private healthcare clinics. Patients share
            their experience; administrators analyze satisfaction, services, and
            staff performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "default" })}
          >
            Open Dashboard →
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "secondary" })}
          >
            Sign In
          </Link>
          <Link
            href="/api/auth/get-session"
            className={buttonVariants({ variant: "outline" })}
          >
            Auth health check
          </Link>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          {stack.map((item) => (
            <div
              key={item.name}
              className="border-border bg-card flex items-start gap-3 rounded-lg border p-4"
=======
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            <a
              href="#how"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e
            >
              How it works
            </a>
            <a
              href="#why"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              Why it matters
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-700 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Staff login
            </Link>
            <Link
              href="/feedback"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/40",
              )}
            >
              Give feedback
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-emerald-200/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-32 -left-40 h-[26rem] w-[26rem] rounded-full bg-teal-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(0.145_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.145_0_0/0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] [background-size:44px_44px]"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
          <div className="flex flex-col items-start gap-7">
            <div className="animate-fade-up">
              <Eyebrow>
                <Sparkles className="size-3.5" aria-hidden />
                Your voice shapes our care
              </Eyebrow>
            </div>

            <h1 className="animate-fade-up text-4xl leading-[1.1] font-bold tracking-tight text-balance text-neutral-900 [animation-delay:100ms] sm:text-5xl lg:text-6xl">
              How was your visit to{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                HealSync?
              </span>
            </h1>

            <p className="animate-fade-up max-w-xl text-lg leading-8 text-pretty text-neutral-600 [animation-delay:200ms]">
              Thanks for trusting us with your health. Tell us about your
              experience — it takes about a minute, and it directly helps our
              team make every visit better.
            </p>

            <div className="animate-fade-up flex flex-wrap items-center gap-3 [animation-delay:300ms]">
              <Link
                href="/feedback"
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-7 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
              >
                <MessageSquareHeart className="size-5" aria-hidden />
                Share your feedback
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <a
                href="#how"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-13 rounded-full border-emerald-200 bg-white/70 px-6 font-semibold text-neutral-700 backdrop-blur transition-all hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                See how it works
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </div>

            <ul className="animate-fade-up flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-600 [animation-delay:400ms]">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-4 text-emerald-500"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up [animation-delay:250ms]">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section
        id="how"
        className="scroll-mt-24 border-y border-emerald-900/5 bg-white"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-neutral-900 sm:text-4xl">
              Share your experience in four quick steps
            </h2>
            <p className="mt-3 text-lg text-pretty text-neutral-600">
              No sign-up, no paperwork — just a few taps from your phone.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.step} className="group relative">
                <div className="flex h-full flex-col items-start gap-4 rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="flex w-full items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Step {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-neutral-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why it matters ────────────────────────────────────────────── */}
      <section
        id="why"
        className="scroll-mt-24 bg-gradient-to-b from-emerald-50/60 via-white to-white"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Why it matters</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-neutral-900 sm:text-4xl">
              Every voice makes our clinic better
            </h2>
            <p className="mt-3 text-lg text-pretty text-neutral-600">
              Your honest feedback shapes the care our whole team delivers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-100/60 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                  <reason.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="relative mt-5 text-lg font-bold text-neutral-900">
                  {reason.title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-neutral-600">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-16 text-center shadow-2xl shadow-emerald-600/25 sm:px-16 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-28 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-8 right-14 h-3 w-3 rounded-full bg-white/40"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-10 left-20 h-2 w-2 rounded-full bg-white/30"
            />

            <div className="relative">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                <HeartPulse className="h-7 w-7 text-white" aria-hidden />
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
                Ready to share your experience?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-pretty text-emerald-50/90">
                It takes about a minute — and it genuinely helps us serve you
                better at every visit.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/feedback"
                  className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Give feedback now
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
              <p className="mt-4 text-sm text-emerald-100/80">
                No account needed · Private &amp; secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-emerald-900/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <HeartPulse className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-base font-bold tracking-tight">
                HealSync
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Feedback platform for private healthcare clinics.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-2">
              <Link
                href="/feedback"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-700"
              >
                Patient feedback
              </Link>
              <span aria-hidden className="text-neutral-300">
                ·
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-emerald-700"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Staff login
              </Link>
            </div>
            <p className="text-xs text-neutral-400">
              © {new Date().getFullYear()} HealSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
