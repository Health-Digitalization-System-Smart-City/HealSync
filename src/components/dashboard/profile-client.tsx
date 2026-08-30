"use client";

import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  KeyRound,
  Lock,
  Mail,
  MessageSquareText,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import {
  getPermissions,
  ROLES,
  type Permission,
  type Role,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * Plain-language capabilities, grouped by area. Each item only shows up when
 * the user's role actually grants the underlying permission — so an Analyst
 * sees a short read-only list while an Admin sees full management powers.
 * No system jargon: this is what the person can do, not how the platform is
 * built underneath.
 */
const CAPABILITY_GROUPS: Array<{
  key: string;
  title: string;
  icon: LucideIcon;
  items: { permission: Permission; label: string }[];
}> = [
  {
    key: "feedback",
    title: "Patient feedback",
    icon: MessageSquareText,
    items: [
      { permission: "feedback.read", label: "Review patient feedback" },
      {
        permission: "feedback.update",
        label: "Update and respond to feedback",
      },
      { permission: "feedback.delete", label: "Remove feedback" },
      { permission: "feedback.phone", label: "See patient contact details" },
    ],
  },
  {
    key: "analytics",
    title: "Analytics & AI",
    icon: BarChart3,
    items: [
      { permission: "analytics.read", label: "Explore analytics and trends" },
      { permission: "analytics.ai", label: "Use AI insights" },
    ],
  },
  {
    key: "branch",
    title: "Clinic branches",
    icon: Building2,
    items: [
      { permission: "branch.read", label: "Monitor clinic branches" },
      { permission: "branch.create", label: "Add new branches" },
      { permission: "branch.update", label: "Edit branch details" },
      { permission: "branch.delete", label: "Close branches" },
    ],
  },
  {
    key: "service",
    title: "Medical services",
    icon: Stethoscope,
    items: [
      { permission: "service.read", label: "Monitor medical services" },
      { permission: "service.create", label: "Add new services" },
      { permission: "service.update", label: "Edit service details" },
      { permission: "service.delete", label: "Stop offering services" },
    ],
  },
  {
    key: "user",
    title: "Users & access",
    icon: Users,
    items: [
      { permission: "user.read", label: "View staff accounts" },
      { permission: "user.create", label: "Create staff accounts" },
      { permission: "user.update", label: "Change roles and details" },
      { permission: "user.disable", label: "Disable accounts" },
    ],
  },
  {
    key: "task",
    title: "Tasks & workflows",
    icon: CheckSquare,
    items: [
      { permission: "task.read", label: "Track operational tasks" },
      { permission: "task.manage", label: "Assign and manage tasks" },
    ],
  },
];

function grantedCapabilityGroups(role: Role) {
  const permissions = getPermissions(role);
  return CAPABILITY_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0);
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLastLogin(iso: string | null): string {
  if (!iso) return "Not recorded";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * One consistent visual unit for every piece of personal info (email, dates,
 * role, …) so the page reads as a cohesive set rather than ad-hoc rows.
 */
function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/70 bg-muted/30 flex min-w-0 items-center gap-3 rounded-xl border p-3">
      <span className="bg-primary/10 text-primary flex size-8.5 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </p>
        <p className="text-foreground truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileClient({
  user,
  createdAt,
  lastLoginAt,
  isActive,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}) {
  const groups = grantedCapabilityGroups(user.role);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Left column: personal account ─────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Identity */}
          <Card className="relative overflow-hidden">
            {/* Soft decorative gradient behind the hero */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-teal-500/15 via-emerald-400/10 to-transparent"
              aria-hidden
            />

            <CardContent className="relative p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="ring-primary/10 flex size-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 text-2xl leading-none font-bold text-white shadow-md ring-4">
                    {initials(user.name)}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-foreground text-2xl font-bold tracking-tight">
                        {user.name}
                      </h2>
                      <Badge
                        variant={
                          user.role === ROLES.ADMIN
                            ? "default"
                            : user.role === ROLES.MANAGER
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs font-bold tracking-wider uppercase"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {user.role} · Smart Feedback dashboard
                    </p>
                  </div>
                </div>

                {/* Status pill */}
                <div
                  className={cn(
                    "flex w-fit items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-medium sm:self-auto",
                    isActive
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  )}
                >
                  <span className="relative flex size-1.5">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                        isActive ? "bg-emerald-400" : "bg-amber-400",
                      )}
                    ></span>
                    <span
                      className={cn(
                        "relative inline-flex size-1.5 rounded-full",
                        isActive ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    ></span>
                  </span>
                  <span>
                    {isActive ? "Active account" : "Account disabled"}
                  </span>
                </div>
              </div>

              {/* Personal info — one consistent tile per detail */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailTile icon={Mail} label="Email" value={user.email} />
                <DetailTile
                  icon={CalendarDays}
                  label="Member since"
                  value={formatDate(createdAt)}
                />
                <DetailTile
                  icon={Clock}
                  label="Last login"
                  value={formatLastLogin(lastLoginAt)}
                />
                <DetailTile icon={UserRound} label="Role" value={user.role} />
              </div>

              {/* Admin-managed notice */}
              <div className="border-border/70 bg-muted/40 text-muted-foreground mt-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <p>
                  Your{" "}
                  <strong className="text-foreground">
                    name, email, and role
                  </strong>{" "}
                  are assigned by your administrator and cannot be changed here.
                  Your password is the only detail you can update yourself — see
                  below.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change password — the only self-service edit */}
          <Card className="border-violet-200/60 dark:border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xs">
                  <KeyRound className="size-4" aria-hidden />
                </span>
                <CardTitle>Change your password</CardTitle>
              </div>
              <CardDescription>
                Your password is private to you — it&apos;s never shown to
                anyone, not even administrators. Updating it signs out your
                other devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: role capabilities + privacy ──────────────── */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* What this role can do */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserRound className="text-primary size-5" aria-hidden />
                <CardTitle>What your {user.role} role can do</CardTitle>
              </div>
              <CardDescription>
                Your access is set by your administrator based on your role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {groups.length === 0 ? (
                <p className="border-border text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-xs">
                  No capabilities are granted to this role.
                </p>
              ) : (
                groups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div
                      key={group.key}
                      className="border-border/70 bg-muted/30 rounded-xl border p-3.5"
                    >
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="bg-primary/10 text-primary flex size-6.5 shrink-0 items-center justify-center rounded-md">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <p className="text-foreground text-xs font-bold">
                          {group.title}
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li
                            key={item.permission}
                            className="text-muted-foreground flex items-start gap-2 text-xs"
                          >
                            <CheckCircle2
                              className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-hidden
                            />
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Private to you */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Lock className="size-4" aria-hidden />
                </span>
                <CardTitle>Private to you</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs leading-relaxed">
                The details on this page — your email, role, and account
                activity — are personal to you. Your password is encrypted and
                never displayed, and only you can change it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
