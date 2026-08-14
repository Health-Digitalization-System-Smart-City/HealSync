"use client";

import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  KeyRound,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthSupportPanel } from "@/features/auth/components/auth-support-panel";

import { authClient } from "@/lib/auth/client";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm({ initialToken }: { initialToken?: string }) {
  // The token arrives in the URL query (?token=...) after Better Auth validates
  // the emailed link; it is passed in from the server component to avoid a
  // client-side searchParams race.
  const searchParams = useSearchParams();
  const token = initialToken ?? searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    token
      ? null
      : "This password-reset link is missing its token. Use the link from your email.",
  );
  const [reset, setReset] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage(
        "This password-reset link is invalid. Please request a new one.",
      );
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setErrorMessage(
          error.code === "INVALID_TOKEN"
            ? "This reset link is invalid or has expired. Please request a new one."
            : (error.message ??
                "Unable to reset your password. Please try again."),
        );
        return;
      }

      setReset(true);
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reset) {
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
                Password updated
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              Your password has been reset successfully. You can now sign in
              with your new credentials.
            </p>
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
          eyebrow="Secure access"
          title="Your account is protected and ready to use."
          description="Start using your new password to sign in to the HealSync dashboard and continue patient care workflows safely."
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
              Choose a new password
            </h1>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            Create a strong password to protect your HealSync account and
            continue with secure access.
          </p>
        </div>

        {errorMessage ? (
          <FormAlert messages={errorMessage} className="mb-4" />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-800"
            >
              New password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="h-12 pl-10"
                minLength={MIN_PASSWORD_LENGTH}
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-slate-500">
              Use at least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-800"
            >
              Confirm password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="h-12 pl-10"
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
                Updating…
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Reset password
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
        eyebrow="Security notice"
        title="Keep access safe, private, and fast."
        description="Choose a password that is unique to your clinic account and easy to remember without compromising security."
        items={[
          "Use a unique password for your clinic account",
          "Avoid reusing passwords from previous systems",
          "Reset links expire quickly to protect your access",
        ]}
      />
    </div>
  );
}
