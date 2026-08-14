import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";

/**
 * Route-group guard for unauthenticated pages (login / forgot-password /
 * reset-password): only *active* signed-in users are redirected away.
 * requireUser() also rejects disabled accounts, so a disabled user with a
 * stale session stays here instead of looping login ↔ dashboard.
 */
export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authResult = await requireUser();
  if (authResult.success) redirect("/dashboard");

  return (
    <main className="bg-background relative flex min-h-screen flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-4 sm:py-0">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
