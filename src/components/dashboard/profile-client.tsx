"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPermissions, type Role } from "@/lib/permissions";

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
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
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
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <Badge
                    variant={user.role === "admin" ? "default" : user.role === "manager" ? "secondary" : "outline"}
                    className="text-xs uppercase font-bold tracking-wider"
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:text-right text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Account Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Verified & Authenticated</span>
              </span>
              <span className="text-[11px]">User ID: {user.id || "usr-current-session"}</span>
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
              <CardTitle>Granted Server Permissions ({permissions.length})</CardTitle>
            </div>
            <CardDescription>
              Permissions assigned to your <strong>{user.role}</strong> role per the server RBAC matrix.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {permissions.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 p-2.5 text-xs font-mono text-foreground"
                >
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <strong>Security Protocol:</strong> Client-side navigation is filtered for convenience; all Server Actions and route handlers verify these permissions independently on every request.
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <CardTitle>Session & Security Status</CardTitle>
            </div>
            <CardDescription>
              Real-time cryptographic authentication telemetry and access scopes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Provider:</span>
                <span className="font-semibold text-foreground">Better Auth (Session Cookie)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role Immutability:</span>
                <span className="font-semibold text-foreground">Fixed RBAC (No client elevation)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Encryption:</span>
                <span className="font-semibold text-foreground">TLS 1.3 / Strict-Transport-Security</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Scope:</span>
                <span className="font-semibold text-foreground">
                  {user.role === "admin"
                    ? "Global (13 Clinic Branches)"
                    : user.role === "manager"
                      ? "Operational Branches"
                      : "Intelligence & BI"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Two-Factor Authentication (2FA)</span>
                <p className="text-[11px] text-muted-foreground">Recommended for administrative roles.</p>
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
