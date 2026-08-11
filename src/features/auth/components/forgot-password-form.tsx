"use client";

import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <Card className="border-border/80 w-full max-w-md shadow-xl">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="animate-in zoom-in-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 duration-300 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-sm text-base">
            If an account exists for <strong>{email.trim()}</strong>, we&apos;ve
            sent a password-reset link. It expires in 1 hour.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
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
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll send you a reset link.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <Alert
            variant="destructive"
            className="animate-in fade-in mb-4 duration-200"
          >
            <Mail className="h-4 w-4" />
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3" />
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
                className="h-11 pl-10"
                autoFocus
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

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 text-sm font-medium underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
