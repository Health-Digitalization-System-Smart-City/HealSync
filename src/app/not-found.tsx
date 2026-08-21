import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, Home, MessageSquareHeart } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page Not Found | HealSync Healthcare",
  description:
    "The page you were looking for could not be found. Return to HealSync home or submit patient feedback.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#F8FAFC] text-slate-900">
      {/* Background ambient gradient glow circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-100/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-slate-100/90 blur-3xl"
      />

      {/* Top navigation header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-[#F8FAFC]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs shadow-teal-700/20">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              HealSync
            </span>
          </Link>

          <Link
            href="/feedback"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-full bg-teal-700 font-semibold text-white shadow-xs shadow-teal-700/20 transition-all hover:bg-teal-800",
            )}
          >
            Give feedback
          </Link>
        </div>
      </header>

      {/* Main 404 content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="surface-card w-full max-w-lg rounded-3xl border p-6 text-center shadow-lg sm:p-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-teal-800 uppercase">
            <span>404 Error</span>
          </div>

          {/* Central Logo / Pulse Icon */}
          <div className="relative mx-auto mt-6 flex size-20 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-xs ring-8 ring-teal-50/60">
            <HeartPulse className="size-10" aria-hidden />
          </div>

          {/* Headline & Friendly Message */}
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Oops! Page Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            We couldn&apos;t find the page you were looking for. The link might
            be outdated, mistyped, or the page may have been moved.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-xl bg-teal-700 font-semibold text-white shadow-xs shadow-teal-700/20 transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md hover:shadow-teal-700/25",
              )}
            >
              <Home className="size-4" aria-hidden />
              <span>Go Back Home</span>
            </Link>

            <Link
              href="/feedback"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "gap-2 rounded-xl border-teal-200 bg-white font-semibold text-teal-800 transition-all hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-900",
              )}
            >
              <MessageSquareHeart
                className="size-4 text-teal-700"
                aria-hidden
              />
              <span>Give Feedback</span>
            </Link>
          </div>

          {/* Extra assistance footer note */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-500">
              Need clinic staff access?{" "}
              <Link
                href="/login"
                className="font-medium text-teal-700 underline-offset-4 hover:underline"
              >
                Staff Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 backdrop-blur-xs">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} HealSync Healthcare. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-colors hover:text-teal-800">
              Home
            </Link>
            <span>·</span>
            <Link
              href="/feedback"
              className="transition-colors hover:text-teal-800"
            >
              Feedback
            </Link>
            <span>·</span>
            <Link
              href="/login"
              className="transition-colors hover:text-teal-800"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
