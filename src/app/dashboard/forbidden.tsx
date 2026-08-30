import Link from "next/link";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="animate-in fade-in-50 flex min-h-[60vh] flex-col items-center justify-center p-6 text-center duration-300">
      <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-xs dark:text-amber-400">
        <ShieldAlert className="size-8" aria-hidden />
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
          <Lock className="size-3" />
        </span>
      </div>

      <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
        Access Restricted (403 Forbidden)
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        Your assigned role lacks the required server-side permission to view or
        manage this resource. Access is governed strictly by the Smart Feedback
        RBAC matrix.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className={buttonVariants({ className: "gap-2 shadow-xs" })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={buttonVariants({ variant: "outline", className: "gap-2" })}
        >
          <span>View My Permissions</span>
        </Link>
      </div>

      <div className="border-border/60 bg-muted/20 mt-8 w-full max-w-md rounded-lg border p-3.5 text-left">
        <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
          <span>Role Policy Reminder</span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs leading-normal">
          • <strong>Admin:</strong> Full system access, staff & branch
          management.
          <br />• <strong>Manager:</strong> Operational dashboard, branch
          metrics, feedback handling.
          <br />• <strong>Analyst:</strong> Read-only analytics and aggregated
          feedback metrics.
        </p>
      </div>
    </div>
  );
}
