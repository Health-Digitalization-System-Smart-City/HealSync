"use client";

import * as React from "react";
import {
  BadgeCheck,
  HeartPulse,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthSupportPanel } from "@/features/auth/components/auth-support-panel";

import { authClient } from "@/lib/auth/client";
import { LanguageSelector } from "@/features/feedback/components/language-selector";

const assurances = [
  "Secure sign in",
  "Server-side session check",
  "Role-based access",
];

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        switch (error.code) {
          case "INVALID_EMAIL_OR_PASSWORD":
            setErrorMessage("Invalid email or password.");
            break;
          case "FAILED_TO_CREATE_SESSION":
            setErrorMessage(
              "Unable to sign in. Your account may be disabled. Contact an administrator.",
            );
            break;
          default:
            setErrorMessage(
              error.message ?? "Unable to sign in. Please try again.",
            );
        }
        return;
      }

      // Navigate to the dashboard and refresh so server-rendered auth state
      // (route guards, nav) picks up the new session.
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-teal-100/70 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="surface-card rounded-[1.5rem] p-6 sm:rounded-[2rem] sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-700/20">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                Staff access
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                HealSync dashboard sign in
              </h1>
            </div>
            <LanguageSelector />
          </div>

          <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              Use your clinic email and password to access the management
              dashboard. Patients use the public feedback flow instead.
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

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-800"
                >
                  Password <span className="text-destructive">*</span>
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
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
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
            {assurances.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-teal-700" aria-hidden />
                {item}
              </span>
            ))}
          </div>

          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
            Access is protected by server-side authentication and role-based
            permissions.
          </p>
        </div>

        <AuthSupportPanel
          eyebrow="Secure access"
          title="Fast sign in for clinic staff."
          description="Keep the login page focused and predictable so staff can get to the dashboard without friction."
          items={[
            "Dashboard access only for authorized users",
            "Disabled users are blocked server-side",
            "Forgot password sends a secure reset link",
          ]}
        />
      </div>
    </div>
  );
}
