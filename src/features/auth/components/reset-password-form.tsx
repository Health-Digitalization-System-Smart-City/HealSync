"use client";

import * as React from "react";
import {
  CheckCircle2,
  HeartPulse,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Card className="border-border/80 w-full max-w-md shadow-xl">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="animate-in zoom-in-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 duration-300 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Password updated
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-sm text-base">
            Your password has been reset. You can now sign in with your new
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full font-semibold shadow-md">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 w-full max-w-md shadow-xl">
      <CardHeader className="space-y-3 pt-8 text-center">
        <div className="text-primary mx-auto inline-flex items-center gap-2 text-xl font-semibold">
          <HeartPulse className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <span>HealSync</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Choose a new password
          </CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {errorMessage ? (
          <FormAlert messages={errorMessage} className="mb-4" />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3" />
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
                className="h-11 pl-10"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <KeyRound className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3" />
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
                className="h-11 pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2 font-semibold shadow-md"
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
      </CardContent>
    </Card>
  );
}
