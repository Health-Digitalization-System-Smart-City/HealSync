"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  HeartPulse,
  Plus,
  Search,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MEDICAL_SERVICES, type MedicalService } from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function ServicesClient({ userRole }: { userRole: Role }) {
  const [services, setServices] = useState<MedicalService[]>(MEDICAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const isAdmin = userRole === "admin";
  const categories = Array.from(new Set(MEDICAL_SERVICES.map((s) => s.category)));

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.headDoctor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" ? true : s.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search medical departments, doctors, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by service category"
              >
                <option value="all">All Service Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {isAdmin ? (
                <Button className="h-9 gap-1.5 shadow-xs">
                  <Plus className="size-4" />
                  <span>New Service</span>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service) => (
          <Card key={service.id} className="hover:border-primary/40 transition-all hover:shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                  {service.category}
                </Badge>
                <span className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{service.satisfactionScore} / 5.0</span>
                </span>
              </div>

              <CardTitle className="text-base font-bold mt-2">
                {service.name}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {service.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Department Head:</span>
                  <span className="font-semibold text-foreground">{service.headDoctor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Triage / Wait:</span>
                  <span className="font-semibold text-foreground">{service.averageWaitMinutes} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Patient Volume:</span>
                  <span className="font-mono text-foreground">{service.monthlyPatients.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  <span>Available Across All 13 Branches</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
