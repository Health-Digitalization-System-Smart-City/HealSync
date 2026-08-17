"use client";

import {
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  Clock,
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

/** Human-readable name for each permission. */
const PERMISSION_LABELS: Record<Permission, string> = {
  "analytics.read": "View analytics",
  "analytics.ai": "AI insights",
  "feedback.read": "View feedback",
  "feedback.update": "Update feedback",
  "feedback.delete": "Delete feedback",
  "feedback.phone": "View patient phone numbers",
  "branch.read": "View branches",
  "branch.create": "Create branches",
  "branch.update": "Update branches",
  "branch.delete": "Delete branches",
  "service.read": "View services",
  "service.create": "Create services",
  "service.update": "Update services",
  "service.delete": "Delete services",
  "user.read": "View users",
  "user.create": "Create users",
  "user.update": "Update users",
  "user.disable": "Disable users",
  "task.read": "View tasks",
  "task.manage": "Manage tasks",
};

/** Permission domain → friendly group title. */
const PERMISSION_GROUPS: Array<{ prefix: string; title: string }> = [
  { prefix: "analytics", title: "Analytics & AI" },
  { prefix: "feedback", title: "Feedback" },
  { prefix: "branch", title: "Branches" },
  { prefix: "service", title: "Services" },
  { prefix: "user", title: "User management" },
  { prefix: "task", title: "Tasks" },
];

function groupPermissions(permissions: readonly Permission[]) {
  return PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: permissions
      .filter((p) => p.startsWith(`${group.prefix}.`))
      .map((p) => PERMISSION_LABELS[p] ?? p),
  })).filter((group) => group.permissions.length > 0);
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
  const permissions = getPermissions(user.role);
  const groups = groupPermissions(permissions);

  return (
    <div className="animate-in fade-in-50 flex flex-col gap-6 duration-300">
      {/* Identity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-bold text-white shadow-sm">
                {user.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
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
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="size-3.5" aria-hidden />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserCheck className="size-3.5" aria-hidden />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {isActive ? "Active account" : "Account disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 sm:flex-col sm:items-end sm:gap-2">
              <div>
                <p className="font-semibold text-slate-700">Member since</p>
                <p className="mt-0.5 flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatDate(createdAt)}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Last login</p>
                <p className="mt-0.5 flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {formatLastLogin(lastLoginAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Admin-managed notice */}
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs text-slate-500">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p>
              Your <strong>name, email, and role</strong> are assigned by your
              administrator and cannot be changed here. Your password is the
              only detail you can update yourself — see below.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Change password — the only self-service edit */}
        <Card className="border-violet-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xs">
                <KeyRound className="size-4" aria-hidden />
              </span>
              <CardTitle>Change your password</CardTitle>
            </div>
            <CardDescription>
              Your account was created by an administrator, so this is the only
              profile detail you can edit. Changing it signs out other devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Security status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle>Session & Security</CardTitle>
            </div>
            <CardDescription>
              How your account is protected and what you are able to do.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="space-y-2 rounded-lg bg-slate-50/70 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Auth provider</span>
                <span className="text-right font-semibold text-slate-800">
                  Better Auth · secure session cookie
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Role</span>
                <span className="text-right font-semibold text-slate-800">
                  {user.role} · fixed by administrator
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Encryption</span>
                <span className="text-right font-semibold text-slate-800">
                  TLS 1.3 / HSTS
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Self-service scope</span>
                <span className="text-right font-semibold text-slate-800">
                  Password only
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <p>
                Server-side authorization is enforced on every request — your
                granted permissions below are verified independently, never just
                hidden in the UI.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions — what the user is allowed to do */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle>
              What you are allowed to do ({permissions.length})
            </CardTitle>
          </div>
          <CardDescription>
            The access granted to your <strong>{user.role}</strong> role by the
            server RBAC matrix.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
              No permissions are granted to this role.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div
                  key={group.prefix}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <p className="mb-2.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    {group.title}
                  </p>
                  <ul className="space-y-2">
                    {group.permissions.map((label) => (
                      <li
                        key={label}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden
                        />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
