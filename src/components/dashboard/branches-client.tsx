"use client";

import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  UserCheck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CLINIC_BRANCHES, type ClinicBranch } from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function BranchesClient({ userRole }: { userRole: Role }) {
  const [branches, setBranches] = useState<ClinicBranch[]>(CLINIC_BRANCHES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  const isAdmin = userRole === "admin";

  const zones = Array.from(new Set(CLINIC_BRANCHES.map((b) => b.zone)));

  const filtered = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
    const matchesZone = zoneFilter === "all" ? true : b.zone === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search branches by code, name, director, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by branch status"
              >
                <option value="all">All Operational Statuses</option>
                <option value="optimal">Optimal</option>
                <option value="high_volume">High Volume</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by district zone"
              >
                <option value="all">All City Zones</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>

              {isAdmin ? (
                <Button className="h-9 gap-1.5 shadow-xs">
                  <Plus className="size-4" />
                  <span>Register Branch</span>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 13 Branch Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((branch) => (
          <Card key={branch.id} className="hover:border-primary/40 transition-all hover:shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {branch.code}
                </span>
                <Badge
                  variant={branch.status === "optimal" ? "outline" : "secondary"}
                  className="text-[10px] uppercase font-bold"
                >
                  {branch.status.replace("_", " ")}
                </Badge>
              </div>

              <CardTitle className="text-base font-bold mt-2">
                {branch.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{branch.address}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Director:</span>
                  <span className="font-semibold text-foreground">{branch.director}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="font-mono text-foreground">{branch.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hours:</span>
                  <span className="text-foreground">{branch.openHours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Staff:</span>
                  <span className="font-semibold text-foreground">{branch.activeStaff} specialists</span>
                </div>
              </div>

              {/* Performance footer */}
              <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{branch.satisfactionRating} / 5.0</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{branch.resolutionRate}%</span> SLA resolution
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
