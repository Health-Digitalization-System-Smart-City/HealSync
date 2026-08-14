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
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
