import {
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
    title: "Scan and start",
    description: "Open the clinic QR code and begin in seconds.",
  },
  {
    icon: Building2,
    step: "2",
    title: "Confirm your branch",
    description: "Choose the location you visited so feedback stays accurate.",
  },
  {
    icon: Stethoscope,
    step: "3",
    title: "Select the service",
    description: "Pick the department or service you interacted with.",
  },
  {
    icon: Star,
    step: "4",
    title: "Rate and submit",
    description: "Share a rating, add a comment, and submit your feedback.",
  },
];

const reasons = [
  {
    icon: HeartHandshake,
    title: "Built for patients",
    description:
      "The interface stays simple: scan, answer, and submit without an account or a complicated form.",
  },
  {
    icon: Timer,
    title: "Fast to complete",
    description:
      "Most people finish in about a minute on a phone, even during a busy clinic visit.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Only the information needed to understand your visit is collected and handled securely.",
  },
];

const assurances = [
  "Mobile-first and touch friendly",
  "No account required",
  "Private and secure",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] text-teal-800 uppercase">
      {children}
    </span>
  );
}

function PhoneMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[320px]">
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[3rem] bg-teal-100/70 blur-3xl"
      />
      <div className="animate-float relative rounded-[2.5rem] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div
          aria-hidden
          className="mx-auto mb-3 h-6 w-24 rounded-full bg-slate-100"
        />
        <div className="rounded-[2rem] border border-teal-100 bg-[#F8FAFC] px-5 pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-white">
                <HeartPulse className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-bold text-neutral-800">
                HealSync
              </span>
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-semibold text-teal-800">
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
                  active ? "w-6 bg-teal-600" : "w-4 bg-teal-200",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
            Step 3 of 4 · Rate your visit
          </p>

          <h3 className="mt-2 text-center text-sm font-bold text-slate-900">
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
                  i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-300",
                )}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-400 shadow-sm">
            Tell us what stood out about your visit...
          </div>

          <div className="mt-3 rounded-full bg-teal-700 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-teal-700/20">
            Submit feedback
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="animate-float-slow absolute top-16 -left-10 hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur sm:flex"
      >
        <CheckCircle2 className="size-5 text-teal-600" />
        <div>
          <p className="text-xs font-semibold text-slate-800">
            Feedback received
          </p>
          <p className="text-[10px] text-slate-500">Thank you</p>
        </div>
      </div>
      <div
        aria-hidden
        className="animate-float-slow absolute -right-10 bottom-14 hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur [animation-delay:1.5s] sm:flex"
      >
        <HeartHandshake className="size-5 text-teal-600" />
        <p className="text-xs font-semibold text-slate-800">
          Built for quick visits
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#F8FAFC]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-700/20">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">HealSync</span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            <a
              href="#how"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800"
            >
              How it works
            </a>
            <a
              href="#why"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800"
            >
              Why it matters
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              aria-label="Staff login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 sm:hidden"
            >
              <LogIn className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-800 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Staff login
            </Link>
            <Link
              href="/feedback"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-teal-700 font-semibold text-white shadow-sm shadow-teal-700/20 transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md hover:shadow-teal-700/25",
              )}
            >
              Give feedback
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-36 -right-24 h-104 w-104 rounded-full bg-teal-100/80 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-24 -left-36 h-96 w-96 rounded-full bg-white/80 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
          <div className="flex flex-col items-start gap-7">
            <div className="animate-fade-up">
              <Eyebrow>
                <Sparkles className="size-3.5" aria-hidden />
                Patient-first feedback
              </Eyebrow>
            </div>

            <h1 className="animate-fade-up text-4xl leading-[1.05] font-bold tracking-tight text-balance text-slate-900 [animation-delay:100ms] sm:text-5xl lg:text-6xl">
              Tell us how your visit went.
            </h1>

            <p className="animate-fade-up max-w-xl text-lg leading-8 text-pretty text-slate-600 [animation-delay:200ms]">
              Scan the QR code at your clinic, answer a few simple questions,
              and submit feedback in about a minute. No account needed.
            </p>

            <div className="animate-fade-up flex flex-wrap items-center gap-3 [animation-delay:300ms]">
              <Link
                href="/feedback"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-teal-700 px-7 text-base font-semibold text-white shadow-sm shadow-teal-700/20 transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md hover:shadow-teal-700/25"
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
                  "h-12 rounded-full border-slate-300 bg-white px-6 font-semibold text-slate-700 shadow-none backdrop-blur transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                See how it works
              </a>
            </div>

            <ul className="animate-fade-up flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 [animation-delay:400ms]">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-teal-600" aria-hidden />
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
        className="scroll-mt-24 border-y border-slate-200 bg-white"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
              Four simple steps from scan to submit
            </h2>
            <p className="mt-3 text-lg text-pretty text-slate-600">
              The flow is intentionally short so patients can finish it without
              confusion or extra typing.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.step} className="group relative">
                <div className="flex h-full flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_10px_30px_rgba(13,148,136,0.08)]">
                  <div className="flex w-full items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-700/20 transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                      Step {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
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
      <section id="why" className="scroll-mt-24 bg-[#F8FAFC]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Why it matters</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
              Calm, private, and easy to use
            </h2>
            <p className="mt-3 text-lg text-pretty text-slate-600">
              The design keeps the focus on the patient experience, not the
              system behind it.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_10px_30px_rgba(13,148,136,0.08)]"
              >
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-teal-100/70 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100 transition-colors duration-300 group-hover:bg-teal-700 group-hover:text-white">
                  <reason.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="relative mt-5 text-lg font-bold text-slate-900">
                  {reason.title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-slate-600">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-teal-700 px-6 py-14 text-center shadow-[0_20px_60px_rgba(15,118,110,0.18)] sm:px-16 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <HeartPulse className="h-7 w-7 text-white" aria-hidden />
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
                Ready to share your experience?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-pretty text-teal-50/90">
                Your feedback helps us improve the next visit for you and for
                everyone else who comes after.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/feedback"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-teal-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  Give feedback now
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
              <p className="mt-4 text-sm text-teal-100/85">
                No account needed · Private and secure
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <HeartPulse className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-base font-bold tracking-tight">
                HealSync
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Feedback platform for private healthcare clinics.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-2">
              <Link
                href="/feedback"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
              >
                Patient feedback
              </Link>
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Staff login
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} HealSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
