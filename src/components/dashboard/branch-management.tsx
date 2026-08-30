"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  LayoutGrid,
  Link2,
  List as ListIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  Star,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/form-alert";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import {
  createBranch,
  deleteBranch,
  setBranchActive,
  setBranchServices,
  updateBranch,
} from "@/features/branches/actions";
import type { BranchOverview } from "@/lib/analytics/db";
import { cn } from "@/lib/utils";

export type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type DialogState =
  | { type: "create" }
  | { type: "edit"; branch: BranchOverview }
  | { type: "services"; branch: BranchOverview }
  | { type: "deactivate"; branch: BranchOverview }
  | { type: "reactivate"; branch: BranchOverview }
  | { type: "delete"; branch: BranchOverview }
  | null;

export interface BranchesViewProps {
  branches: BranchOverview[];
  services: ServiceOption[];
  branchServiceIds: Record<string, string[]>;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete?: boolean;
}

type SortOption =
  | "satisfaction_desc"
  | "satisfaction_asc"
  | "feedback_desc"
  | "feedback_asc"
  | "name_asc";

type StatusFilter = "all" | "active" | "inactive" | "attention";

export function BranchesView({
  branches,
  services,
  branchServiceIds,
  canCreate,
  canUpdate,
  canDelete = false,
}: BranchesViewProps) {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("satisfaction_desc");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Dialog State
  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  // Form State
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>(
    [],
  );

  // Filter and sort branches
  const filteredBranches = React.useMemo(() => {
    return branches
      .filter((branch) => {
        const matchesSearch =
          branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (branch.code &&
            branch.code.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === "active") matchesStatus = branch.isActive;
        else if (statusFilter === "inactive") matchesStatus = !branch.isActive;
        else if (statusFilter === "attention") {
          matchesStatus =
            branch.isActive &&
            branch.satisfactionRate < 60 &&
            branch.totalFeedback > 0;
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "satisfaction_desc") {
          return (
            b.satisfactionRate - a.satisfactionRate ||
            b.totalFeedback - a.totalFeedback
          );
        }
        if (sortBy === "satisfaction_asc") {
          return (
            a.satisfactionRate - b.satisfactionRate ||
            a.totalFeedback - b.totalFeedback
          );
        }
        if (sortBy === "feedback_desc") {
          return (
            b.totalFeedback - a.totalFeedback ||
            b.satisfactionRate - a.satisfactionRate
          );
        }
        if (sortBy === "feedback_asc") {
          return (
            a.totalFeedback - b.totalFeedback ||
            a.satisfactionRate - b.satisfactionRate
          );
        }
        return a.name.localeCompare(b.name);
      });
  }, [branches, searchQuery, statusFilter, sortBy]);

  // Dialog Openers
  function openCreate() {
    setName("");
    setCode("");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "create" });
  }

  function openEdit(branch: BranchOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setName(branch.name);
    setCode(branch.code ?? "");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "edit", branch });
  }

  function openServices(branch: BranchOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setSelectedServiceIds(branchServiceIds[branch.id] ?? []);
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "services", branch });
  }

  function openDeactivate(branch: BranchOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setErrorMessage(null);
    setDialog({ type: "deactivate", branch });
  }

  function openReactivate(branch: BranchOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setErrorMessage(null);
    setDialog({ type: "reactivate", branch });
  }

  function openDelete(branch: BranchOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setErrorMessage(null);
    setDialog({ type: "delete", branch });
  }

  // Submit handlers
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const res = await createBranch({ name, code });
      if (!res.success) {
        setErrorMessage(res.error.message);
        if (res.error.fieldErrors) setFieldErrors(res.error.fieldErrors);
        return;
      }
      setDialog(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!dialog || dialog.type !== "edit") return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const res = await updateBranch({
        id: dialog.branch.id,
        name,
        code,
      });
      if (!res.success) {
        setErrorMessage(res.error.message);
        if (res.error.fieldErrors) setFieldErrors(res.error.fieldErrors);
        return;
      }
      setDialog(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveServices(e: React.FormEvent) {
    e.preventDefault();
    if (!dialog || dialog.type !== "services") return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await setBranchServices({
        branchId: dialog.branch.id,
        serviceIds: selectedServiceIds,
      });
      if (!res.success) {
        setErrorMessage(res.error.message);
        return;
      }
      setDialog(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetActive(isActive: boolean) {
    if (
      !dialog ||
      (dialog.type !== "deactivate" && dialog.type !== "reactivate")
    )
      return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await setBranchActive({
        id: dialog.branch.id,
        isActive,
      });
      if (!res.success) {
        setErrorMessage(res.error.message);
        return;
      }
      setDialog(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!dialog || dialog.type !== "delete") return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await deleteBranch({ id: dialog.branch.id });
      if (!res.success) {
        setErrorMessage(res.error.message);
        return;
      }
      setDialog(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  const dialogTitle =
    dialog?.type === "create"
      ? "Add New Clinic Branch"
      : dialog?.type === "edit"
        ? `Edit ${dialog.branch.name}`
        : dialog?.type === "services"
          ? `Services at ${dialog.branch.name}`
          : dialog?.type === "deactivate"
            ? `Deactivate ${dialog.branch.name}?`
            : dialog?.type === "reactivate"
              ? `Reactivate ${dialog.branch.name}?`
              : dialog?.type === "delete"
                ? `Delete ${dialog.branch.name}?`
                : "";

  return (
    <div className="space-y-6">
      {/* 1. Interactive Operations Control Bar */}
      <div className="border-border/80 bg-card flex flex-col gap-4 rounded-2xl border p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Search input */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              placeholder="Search branches by name, location, or branch code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Right Controls: Filters, Sort, View Toggle, Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border-border bg-background text-foreground focus:ring-ring h-9 rounded-xl border px-2.5 text-xs font-medium outline-none focus:ring-2"
              aria-label="Filter branch status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="attention">Needs Attention (&lt;60%)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border-border bg-background text-foreground focus:ring-ring h-9 rounded-xl border px-2.5 text-xs font-medium outline-none focus:ring-2"
              aria-label="Sort branch list"
            >
              <option value="satisfaction_desc">Highest Satisfaction</option>
              <option value="satisfaction_asc">Lowest Satisfaction</option>
              <option value="feedback_desc">Most Feedback</option>
              <option value="feedback_asc">Least Feedback</option>
              <option value="name_asc">Alphabetical (A–Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="bg-muted/60 border-border/60 flex items-center rounded-xl border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold transition",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold transition",
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Table view"
              >
                <ListIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {canCreate && (
              <Button onClick={openCreate} className="h-9 gap-1.5 shadow-xs">
                <Plus className="size-4" />
                <span>Add Branch</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active scope indicator & count */}
        <div className="text-muted-foreground border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {filteredBranches.length}
              </strong>{" "}
              of {branches.length} clinic locations
            </span>
            {searchQuery && (
              <span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 text-[11px]">
                Matching &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <span className="text-[11px]">
            Click any branch to inspect operational analytics
          </span>
        </div>
      </div>

      {/* 2. Main Content Display: Grid or Table */}
      {filteredBranches.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-xs">
          <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
            <Building2 className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">
            No Matching Clinic Branches
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            {branches.length === 0
              ? "Add your first clinic branch location to start tracking patient satisfaction."
              : "No clinic branches match your current search or status filter criteria."}
          </p>
          {branches.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("satisfaction_desc");
              }}
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </Button>
          ) : canCreate ? (
            <Button onClick={openCreate} className="mt-4 gap-1.5">
              <Plus className="size-4" />
              <span>Add First Branch</span>
            </Button>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        /* Operational Grid View */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBranches.map((branch) => {
            const hasFeedback = branch.totalFeedback > 0;
            const isHigh = branch.satisfactionRate >= 75 && hasFeedback;
            const isLow = branch.satisfactionRate < 60 && hasFeedback;

            return (
              <Link
                key={branch.id}
                href={`/dashboard/branches/${branch.id}`}
                className="group border-border/80 bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md"
              >
                {/* Status indicator bar */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    branch.isActive
                      ? isHigh
                        ? "from-emerald-500 to-teal-400"
                        : isLow
                          ? "from-amber-500 to-orange-400"
                          : "from-blue-500 to-teal-400"
                      : "from-slate-400 to-slate-500",
                  )}
                  aria-hidden
                />

                <div>
                  {/* Card Header: Initials Avatar, Name, Code, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-transform group-hover:scale-105">
                        {branch.code?.slice(0, 3) ||
                          branch.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
                            {branch.name}
                          </h3>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
                          <MapPin className="text-muted-foreground/70 size-3" />
                          <span>{branch.code || "Main Campus"}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        branch.isActive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "border-border bg-muted text-muted-foreground border",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          branch.isActive
                            ? "animate-pulse bg-emerald-500"
                            : "bg-muted-foreground",
                        )}
                      />
                      {branch.isActive ? "Active" : "Closed"}
                    </span>
                  </div>

                  {/* Primary Satisfaction & Feedback Stats */}
                  <div className="bg-muted/30 border-border/50 mt-4 grid grid-cols-2 gap-2 rounded-xl border p-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-semibold tracking-wider uppercase">
                        Satisfaction
                      </span>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-foreground text-2xl font-bold tracking-tight">
                          {hasFeedback ? `${branch.satisfactionRate}%` : "—"}
                        </span>
                        {hasFeedback && (
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              isHigh
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isLow
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-blue-600 dark:text-blue-400",
                            )}
                          >
                            {isHigh
                              ? "Excellent"
                              : isLow
                                ? "Attention"
                                : "Solid"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px] font-semibold tracking-wider uppercase">
                        Feedback Volume
                      </span>
                      <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-foreground text-2xl font-bold tracking-tight">
                          {branch.totalFeedback.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="mt-3">
                    <SatisfactionBar
                      positive={branch.positive}
                      neutral={branch.neutral}
                      negative={branch.negative}
                      showLegend={false}
                    />
                  </div>

                  {/* Secondary Operational Metadata */}
                  <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <strong className="text-foreground font-semibold">
                        {hasFeedback ? branch.avgScore.toFixed(1) : "—"}
                      </strong>
                      <span>/ 7 avg</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Stethoscope className="text-primary size-3.5" />
                      <strong className="text-foreground font-semibold">
                        {branch.servicesCount}
                      </strong>
                      <span>services offered</span>
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5">
                    <span>Inspect analytics</span>
                    <ArrowRight className="size-3" />
                  </span>

                  {(canUpdate || canDelete) && (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7.5 px-2 text-xs"
                        onClick={(e) => openServices(branch, e)}
                        title="Link clinical services"
                      >
                        <Link2 className="mr-1 size-3.5" />
                        Services
                      </Button>
                      {canUpdate && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7.5 px-2 text-xs"
                            onClick={(e) => openEdit(branch, e)}
                            title="Edit branch details"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          {branch.isActive ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7.5 px-2 text-xs text-amber-600 hover:text-amber-700"
                              onClick={(e) => openDeactivate(branch, e)}
                              title="Deactivate branch"
                            >
                              <Power className="size-3.5" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7.5 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                              onClick={(e) => openReactivate(branch, e)}
                              title="Reactivate branch"
                            >
                              <RotateCcw className="size-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                      {canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7.5 px-2 text-xs text-rose-600 hover:text-rose-700"
                          onClick={(e) => openDelete(branch, e)}
                          title="Delete branch permanently"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Operational Table View */
        <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border/80 bg-muted/40 text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="px-5 py-3.5">Clinic Branch</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Satisfaction Index</th>
                  <th className="px-4 py-3.5">Rating Score</th>
                  <th className="px-4 py-3.5">Feedback Volume</th>
                  <th className="px-4 py-3.5">Services Linked</th>
                  <th className="px-5 py-3.5 text-right">
                    Operational Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {filteredBranches.map((branch) => {
                  const hasFeedback = branch.totalFeedback > 0;
                  const isHigh = branch.satisfactionRate >= 75 && hasFeedback;
                  const isLow = branch.satisfactionRate < 60 && hasFeedback;

                  return (
                    <tr
                      key={branch.id}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/branches/${branch.id}`)
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold">
                            {branch.code?.slice(0, 3) ||
                              branch.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-foreground hover:text-primary block text-sm font-bold transition-colors">
                              {branch.name}
                            </span>
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {branch.code || "Main Campus"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            branch.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "border-border bg-muted text-muted-foreground border",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              branch.isActive
                                ? "animate-pulse bg-emerald-500"
                                : "bg-muted-foreground",
                            )}
                          />
                          {branch.isActive ? "Active" : "Closed"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono text-sm font-bold",
                              isHigh
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isLow
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-foreground",
                            )}
                          >
                            {hasFeedback ? `${branch.satisfactionRate}%` : "—"}
                          </span>
                          {hasFeedback && (
                            <div className="w-20">
                              <SatisfactionBar
                                positive={branch.positive}
                                neutral={branch.neutral}
                                negative={branch.negative}
                                showLegend={false}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <span className="text-foreground font-bold">
                          {hasFeedback ? branch.avgScore.toFixed(1) : "—"}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {" "}
                          / 7
                        </span>
                      </td>

                      <td className="text-foreground px-4 py-3.5 font-mono font-semibold">
                        {branch.totalFeedback.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                          <Stethoscope className="text-primary size-3" />
                          {branch.servicesCount} Departments
                        </span>
                      </td>

                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            Analytics
                          </Button>
                          {canUpdate && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={(e) => openServices(branch, e)}
                              >
                                <Link2 className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={(e) => openEdit(branch, e)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              {branch.isActive ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-amber-600 hover:text-amber-700"
                                  onClick={(e) => openDeactivate(branch, e)}
                                  title="Deactivate"
                                >
                                  <Power className="size-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-emerald-600 hover:text-emerald-700"
                                  onClick={(e) => openReactivate(branch, e)}
                                  title="Reactivate"
                                >
                                  <RotateCcw className="size-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700"
                              onClick={(e) => openDelete(branch, e)}
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CRUD Modals & Management Dialogs */}
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
          <Dialog.Popup className="border-border bg-card fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h2 className="text-foreground text-lg font-bold">
                {dialogTitle}
              </h2>
              <Dialog.Close
                aria-label="Close dialog"
                className="text-muted-foreground hover:bg-muted rounded-lg p-1"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="mt-4">
              {errorMessage && (
                <FormAlert messages={errorMessage} className="mb-4" />
              )}

              {(dialog?.type === "create" || dialog?.type === "edit") && (
                <form
                  onSubmit={
                    dialog.type === "create" ? handleCreate : handleEdit
                  }
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="branch-name"
                      className="text-foreground text-xs font-semibold"
                    >
                      Branch Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="branch-name"
                      required
                      placeholder="e.g. Bole Medhanialem Clinic"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={Boolean(fieldErrors.name?.length)}
                    />
                    <FormAlert messages={fieldErrors.name} compact />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="branch-code"
                      className="text-foreground text-xs font-semibold"
                    >
                      Branch Code / Identifier
                    </Label>
                    <Input
                      id="branch-code"
                      placeholder="e.g. BR-BOL-01"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      error={Boolean(fieldErrors.code?.length)}
                    />
                    <p className="text-muted-foreground text-[11px]">
                      Unique operational identifier displayed on patient triage
                      and review forms.
                    </p>
                    <FormAlert messages={fieldErrors.code} compact />
                  </div>

                  <div className="border-border flex justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="size-3.5" />
                          <span>Save Branch</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {dialog?.type === "services" && (
                <form onSubmit={handleSaveServices} className="space-y-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Select clinical departments authorized to receive patient
                    feedback at this clinic location.
                  </p>

                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {services.map((service) => {
                      const checked = selectedServiceIds.includes(service.id);
                      return (
                        <label
                          key={service.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                            checked
                              ? "border-primary/50 bg-primary/5 shadow-2xs"
                              : "border-border hover:bg-muted/40",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary size-4"
                            checked={checked}
                            disabled={!service.isActive}
                            onChange={() => toggleService(service.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-foreground block text-sm font-semibold">
                              {service.name}
                            </span>
                            {service.description && (
                              <span className="text-muted-foreground block truncate text-xs">
                                {service.description}
                              </span>
                            )}
                          </div>
                          {!service.isActive && (
                            <Badge variant="outline" className="text-[10px]">
                              Inactive
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="border-border flex justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="size-3.5" />
                          <span>Save Services</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {(dialog?.type === "deactivate" ||
                dialog?.type === "reactivate") && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {dialog.type === "deactivate"
                      ? `\"${dialog.branch.name}\" will stop accepting new patient submissions. Historical feedback analytics and service configurations are permanently retained.`
                      : `\"${dialog.branch.name}\" will immediately resume accepting patient feedback across all previously linked medical services.`}
                  </p>
                  <div className="border-border flex justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleSetActive(dialog.type === "reactivate")
                      }
                      className={
                        dialog.type === "deactivate"
                          ? "gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
                          : "gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      }
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : dialog.type === "deactivate" ? (
                        <Power className="size-3.5" />
                      ) : (
                        <RotateCcw className="size-3.5" />
                      )}
                      <span>
                        {dialog.type === "deactivate"
                          ? "Deactivate Branch"
                          : "Reactivate Branch"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {dialog?.type === "delete" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                        This action cannot be undone
                      </p>
                      <p className="text-sm leading-relaxed text-rose-700 dark:text-rose-400">
                        Deleting &quot;{dialog.branch.name}&quot; will
                        permanently remove the branch, all linked services, and
                        all associated data. If this branch has feedback
                        submissions, you must deactivate it instead.
                      </p>
                    </div>
                  </div>
                  <div className="border-border flex justify-end gap-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={handleDelete}
                      className="gap-1.5 bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      <span>Delete Branch Permanently</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
