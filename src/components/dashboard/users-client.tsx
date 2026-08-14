"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lock,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STAFF_USERS, type StaffUser } from "@/lib/dashboard-data";
import { PERMISSIONS, getPermissions, type Role } from "@/lib/permissions";

export function UsersClient({ userRole }: { userRole: Role }) {
  const [users, setUsers] = useState<StaffUser[]>(STAFF_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.assignedBranch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const matrixPermissions = [
    { key: PERMISSIONS.ANALYTICS_READ, label: "Analytics (Read BI Telemetry)" },
    { key: PERMISSIONS.FEEDBACK_READ, label: "Feedback (Read Patient Stream)" },
    { key: PERMISSIONS.FEEDBACK_UPDATE, label: "Feedback (Update/Resolve Status)" },
    { key: PERMISSIONS.FEEDBACK_DELETE, label: "Feedback (Permanent Deletion)" },
    { key: PERMISSIONS.TASK_READ, label: "Tasks (View Operational Workflows)" },
    { key: PERMISSIONS.TASK_MANAGE, label: "Tasks (Create/Assign/Complete)" },
    { key: PERMISSIONS.BRANCH_READ, label: "Branches (View 13 Clinic Locations)" },
    { key: PERMISSIONS.BRANCH_CREATE, label: "Branches (Register/Edit Branch)" },
    { key: PERMISSIONS.SERVICE_READ, label: "Services (View Medical Directory)" },
    { key: PERMISSIONS.SERVICE_CREATE, label: "Services (Manage Specialties)" },
    { key: PERMISSIONS.USER_READ, label: "Users & RBAC (Manage Staff Directory)" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Search & Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, or branch assignment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by staff role"
              >
                <option value="all">All Staff Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
              </select>

              <Button className="h-9 gap-1.5 shadow-xs">
                <UserPlus className="size-4" />
                <span>Invite Staff Member</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Directory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory & Session Telemetry</CardTitle>
          <CardDescription>
            Authorized personnel registered with HealSync Smart City RBAC security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Clinic / Branch Scope</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          <div className="text-[11px] text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={user.role === "admin" ? "default" : user.role === "manager" ? "secondary" : "outline"}
                        className="text-[10px] uppercase font-bold tracking-wider"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{user.assignedBranch}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[11px] text-muted-foreground">
                      {user.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* RBAC Role Permission Matrix Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <CardTitle>HealSync RBAC Permission Matrix (Security Standard)</CardTitle>
          </div>
          <CardDescription>
            Fixed server-side authorization matrix as defined in <code>docs/SECURITY.md §2 & §3</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Permission Resource</th>
                  <th className="pb-3 font-semibold text-center">Admin</th>
                  <th className="pb-3 font-semibold text-center">Manager</th>
                  <th className="pb-3 font-semibold text-center">Analyst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {matrixPermissions.map((perm) => {
                  const adminHas = getPermissions("admin").includes(perm.key as any);
                  const managerHas = getPermissions("manager").includes(perm.key as any);
                  const analystHas = getPermissions("analyst").includes(perm.key as any);

                  return (
                    <tr key={perm.key} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium text-foreground">
                        <span className="font-mono text-muted-foreground mr-2 text-[10px]">{perm.key}</span>
                        <span>{perm.label}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        {adminHas ? (
                          <Check className="inline-block size-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <X className="inline-block size-4 text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {managerHas ? (
                          <Check className="inline-block size-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <X className="inline-block size-4 text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {analystHas ? (
                          <Check className="inline-block size-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                        ) : (
                          <X className="inline-block size-4 text-muted-foreground/30" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
