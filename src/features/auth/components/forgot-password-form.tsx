"use client";

import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthSupportPanel } from "@/features/auth/components/auth-support-panel";

import { authClient } from "@/lib/auth/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Fire-and-forget semantics: the endpoint always returns the same
      // response whether or not the email exists (timing-attack mitigation).
      await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      setSent(true);
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="relative grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="surface-card rounded-[1.5rem] p-6 sm:rounded-[2rem] sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-700/20">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                Password reset
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Check your email
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              If an account exists for{" "}
              <strong className="font-semibold">{email.trim()}</strong>,
              we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-teal-700" aria-hidden />
              Check the inbox tied to your clinic account.
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <ArrowLeft className="h-5 w-5 text-teal-700" aria-hidden />
              Use the link to return to the secure reset screen.
            </div>
          </div>

          <div className="mt-6">
            <Button asChild className="h-12 w-full rounded-full">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>

        <AuthSupportPanel
          eyebrow="What happens next"
          title="Reset links stay short, clear, and secure."
          description="Keep the recovery flow simple so staff can regain access without a confusing support process."
        />
      </div>
    );
  }

  return (
    <div className="relative grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="surface-card rounded-[1.5rem] p-6 sm:rounded-[2rem] sm:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-700/20">
            <HeartPulse className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
              Account recovery
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Reset your password
            </h1>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            Enter the email tied to your clinic account and we&apos;ll send a
            secure reset link.
          </p>
        </div>

        {errorMessage ? (
          <FormAlert messages={errorMessage} className="mb-4" />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-800"
            >
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@healsync.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                className="h-12 pl-10"
                autoFocus
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>

      <AuthSupportPanel
        eyebrow="Recovery flow"
        title="Clear instructions, minimal friction."
        description="Password recovery should feel calm and predictable, not like a support ticket."
        items={[
          "We never reveal whether an email exists",
          "Reset links expire quickly",
          "You can return to sign in at any time",
        ]}
      />
    </div>
  );
}
