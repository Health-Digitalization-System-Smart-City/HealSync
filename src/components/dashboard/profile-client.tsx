"use client";

import {
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPermissions, ROLES, type Role } from "@/lib/permissions";

export function ProfileClient({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}) {
  const permissions = getPermissions(user.role);

  return (
    <div className="animate-in fade-in-50 flex flex-col gap-6 duration-300">
      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-primary-foreground flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm">
                {user.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-foreground text-xl font-bold">
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
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Mail className="size-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="text-muted-foreground flex flex-col gap-1 text-xs sm:text-right">
              <span className="text-foreground font-semibold">
                Account Status
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Verified & Authenticated</span>
              </span>
              <span className="text-[11px]">
                User ID: {user.id || "usr-current-session"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Granted Server-Side Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle>
                Granted Server Permissions ({permissions.length})
              </CardTitle>
            </div>
            <CardDescription>
              Permissions assigned to your <strong>{user.role}</strong> role per
              the server RBAC matrix.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {permissions.map((perm) => (
                <div
                  key={perm}
                  className="border-border/80 bg-muted/30 text-foreground flex items-center gap-2 rounded-lg border p-2.5 font-mono text-xs"
                >
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>

            <div className="border-border/60 bg-muted/20 text-muted-foreground mt-4 rounded-lg border p-3 text-xs">
              <strong>Security Protocol:</strong> Client-side navigation is
              filtered for convenience; all Server Actions and route handlers
              verify these permissions independently on every request.
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="text-primary size-5" />
              <CardTitle>Session & Security Status</CardTitle>
            </div>
            <CardDescription>
              Real-time cryptographic authentication telemetry and access
              scopes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="bg-muted/40 space-y-2 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Provider:</span>
                <span className="text-foreground font-semibold">
                  Better Auth (Session Cookie)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Role Immutability:
                </span>
                <span className="text-foreground font-semibold">
                  Fixed RBAC (No client elevation)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Encryption:</span>
                <span className="text-foreground font-semibold">
                  TLS 1.3 / Strict-Transport-Security
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Scope:</span>
                <span className="text-foreground font-semibold">
                  {user.role === ROLES.ADMIN
                    ? "Global (13 Clinic Branches)"
                    : user.role === ROLES.MANAGER
                      ? "Operational Branches"
                      : "Intelligence & BI"}
                </span>
              </div>
            </div>

            <div className="border-border/70 flex items-center justify-between rounded-lg border p-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-foreground font-semibold">
                  Two-Factor Authentication (2FA)
                </span>
                <p className="text-muted-foreground text-[11px]">
                  Recommended for administrative roles.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Enforced by Policy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
