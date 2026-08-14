"use client";

import * as React from "react";
import {
  HeartPulse,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authClient } from "@/lib/auth/client";

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
    <Card className="border-border/80 w-full max-w-md shadow-xl">
      <CardHeader className="space-y-3 pt-8 text-center">
        <div className="text-primary mx-auto inline-flex items-center gap-2 text-xl font-semibold">
          <HeartPulse className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <span>HealSync</span>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign in to the dashboard
          </CardTitle>
          <CardDescription>Authorized clinic personnel only.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {errorMessage ? (
          <FormAlert messages={errorMessage} className="mb-4" />
        ) : null}

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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </Label>
              <a
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-xs font-medium underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3" />
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
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 border-t pt-6 text-center">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Protected by server-side authentication &amp; role-based access
          control.
        </p>
      </CardFooter>
    </Card>
  );
}
