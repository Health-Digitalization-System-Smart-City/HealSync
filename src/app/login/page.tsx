import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="size-5" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">HealSync</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to the clinic feedback dashboard.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need an account? Contact your administrator.{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
