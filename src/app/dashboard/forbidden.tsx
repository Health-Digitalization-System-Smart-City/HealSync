import Link from "next/link";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center animate-in fade-in-50 duration-300">
      <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
        <ShieldAlert className="size-8" aria-hidden />
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
          <Lock className="size-3" />
        </span>
      </div>

      <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
        Access Restricted (403 Forbidden)
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        Your assigned role lacks the required server-side permission to view or manage this resource.
        Access is governed strictly by the HealSync RBAC matrix.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/dashboard" />} className="gap-2 shadow-xs">
          <ArrowLeft className="size-4" aria-hidden />
          <span>Return to Dashboard</span>
        </Button>
        <Button variant="outline" render={<Link href="/dashboard/profile" />} className="gap-2">
          <span>View My Permissions</span>
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-border/60 bg-muted/20 p-3.5 text-left max-w-md w-full">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span>Role Policy Reminder</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-normal">
          • <strong>Admin:</strong> Full system access, staff & branch management.<br />
          • <strong>Manager:</strong> Operational dashboard, branch metrics, feedback handling.<br />
          • <strong>Analyst:</strong> Read-only analytics and aggregated feedback metrics.
        </p>
      </div>
    </div>
  );
}
