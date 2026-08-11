import { BarChart3, HeartPulse, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const authResult = await requireUser();
  if (!authResult.success) return null; // layout already redirects

  const user = authResult.data;
  const canManageUsers = await can(user.id, "user.read");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          Signed in as {user.role}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0] || user.name}
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          This is your secure administrative dashboard. Patient feedback
          analytics, branch and service management, and AI insights arrive in
          upcoming workstreams.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" aria-hidden />
              Analytics
            </CardTitle>
            <CardDescription>
              Satisfaction, branch &amp; service performance, and trends across
              the clinic network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground text-sm">
              Coming in a future workstream.
            </span>
          </CardContent>
        </Card>

        {canManageUsers && (
          <Card className="border-primary/20 from-primary/5 bg-gradient-to-b to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary h-5 w-5" aria-hidden />
                User management
              </CardTitle>
              <CardDescription>
                Create dashboard users, assign roles, and disable access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/users"
                className={
                  buttonVariants({ variant: "default", size: "sm" }) +
                  " gap-2 font-semibold"
                }
              >
                <Users className="h-4 w-4" aria-hidden />
                Manage users
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <HeartPulse className="h-4 w-4 text-emerald-500" aria-hidden />
        Authentication &amp; role-based access control are active.
      </p>
    </div>
  );
}
