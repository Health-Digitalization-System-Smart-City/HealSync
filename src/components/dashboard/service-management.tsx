"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Search,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/form-alert";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import {
  createService,
  setServiceActive,
  updateService,
} from "@/features/services/actions";
import type { ServiceOverview } from "@/lib/analytics/db";
import { getServiceIcon } from "@/lib/services/icons";
import { cn } from "@/lib/utils";

type DialogState =
  | { type: "create" }
  | { type: "edit"; service: ServiceOverview }
  | { type: "deactivate"; service: ServiceOverview }
  | { type: "reactivate"; service: ServiceOverview }
  | null;

export interface ServicesViewProps {
  services: ServiceOverview[];
  canCreate: boolean;
  canUpdate: boolean;
}

type SortOption =
  | "satisfaction_desc"
  | "satisfaction_asc"
  | "feedback_desc"
  | "feedback_asc"
  | "name_asc";

type StatusFilter = "all" | "active" | "inactive" | "attention";

export function ServicesView({
  services,
  canCreate,
  canUpdate,
}: ServicesViewProps) {
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
  const [description, setDescription] = React.useState("");

  // Filter and sort services
  const filteredServices = React.useMemo(() => {
    return services
      .filter((service) => {
        const matchesSearch =
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description &&
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === "active") matchesStatus = service.isActive;
        else if (statusFilter === "inactive") matchesStatus = !service.isActive;
        else if (statusFilter === "attention") {
          matchesStatus =
            service.isActive &&
            service.satisfactionRate < 60 &&
            service.totalFeedback > 0;
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
  }, [services, searchQuery, statusFilter, sortBy]);

  // Dialog Openers
  function openCreate() {
    setName("");
    setDescription("");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "create" });
  }

  function openEdit(service: ServiceOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setName(service.name);
    setDescription(service.description ?? "");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "edit", service });
  }

  function openDeactivate(service: ServiceOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setErrorMessage(null);
    setDialog({ type: "deactivate", service });
  }

  function openReactivate(service: ServiceOverview, e?: React.MouseEvent) {
    e?.stopPropagation();
    setErrorMessage(null);
    setDialog({ type: "reactivate", service });
  }

  // Submit handlers
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dialog || (dialog.type !== "create" && dialog.type !== "edit")) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const res =
        dialog.type === "create"
          ? await createService({ name, description })
          : await updateService({
              id: dialog.service.id,
              name,
              description,
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

  async function handleSetActive(isActive: boolean) {
    if (
      !dialog ||
      (dialog.type !== "deactivate" && dialog.type !== "reactivate")
    )
      return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await setServiceActive({
        id: dialog.service.id,
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

  const dialogTitle =
    dialog?.type === "create"
      ? "Add Clinical Service"
      : dialog?.type === "edit"
        ? `Edit ${dialog.service.name}`
        : dialog?.type === "deactivate"
          ? `Stop offering ${dialog.service.name}?`
          : dialog?.type === "reactivate"
            ? `Reactivate ${dialog.service.name}?`
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
              placeholder="Search services by clinical department name or clinical scope..."
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
              aria-label="Filter service status"
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
              aria-label="Sort service list"
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
                <span>Add Service</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active scope indicator */}
        <div className="text-muted-foreground border-border/50 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {filteredServices.length}
              </strong>{" "}
              of {services.length} medical services
            </span>
            {searchQuery && (
              <span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 text-[11px]">
                Matching &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <span className="text-[11px]">
            Click any service to inspect department analytics
          </span>
        </div>
      </div>

      {/* 2. Main Content: Grid or Table */}
      {filteredServices.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-xs">
          <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
            <Activity className="text-muted-foreground size-6" />
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">
            No Matching Healthcare Services
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            {services.length === 0
              ? "Add your first medical service or clinical department to organize patient satisfaction analytics."
              : "No services match your current search or status filter criteria."}
          </p>
          {services.length > 0 ? (
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
              <span>Add First Service</span>
            </Button>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        /* Operational Grid View */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => {
            const Icon = getServiceIcon(service.name);
            const hasFeedback = service.totalFeedback > 0;
            const isHigh = service.satisfactionRate >= 75 && hasFeedback;
            const isLow = service.satisfactionRate < 60 && hasFeedback;

            return (
              <div
                key={service.id}
                onClick={() => router.push(`/dashboard/services/${service.id}`)}
                className="group border-border/80 bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md"
              >
                {/* Status indicator bar */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    service.isActive
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
                  {/* Card Header: Medical Icon, Name, Scope, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground truncate text-xs">
                          {service.description || "Clinical department"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        service.isActive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "border-border bg-muted text-muted-foreground border",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          service.isActive
                            ? "animate-pulse bg-emerald-500"
                            : "bg-muted-foreground",
                        )}
                      />
                      {service.isActive ? "Active" : "Stopped"}
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
                          {hasFeedback ? `${service.satisfactionRate}%` : "—"}
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
                          {service.totalFeedback.toLocaleString()}
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
                      positive={service.positive}
                      neutral={service.neutral}
                      negative={service.negative}
                      showLegend={false}
                    />
                  </div>

                  {/* Secondary Metadata */}
                  <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <strong className="text-foreground font-semibold">
                        {hasFeedback ? service.avgScore.toFixed(1) : "—"}
                      </strong>
                      <span>/ 7 avg</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Building2 className="text-primary size-3.5" />
                      <strong className="text-foreground font-semibold">
                        {service.branchesCount}
                      </strong>
                      <span>clinics offering</span>
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5">
                    <span>Inspect analytics</span>
                    <ArrowRight className="size-3" />
                  </span>

                  {canUpdate && (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7.5 px-2 text-xs"
                        onClick={(e) => openEdit(service, e)}
                        title="Edit service details"
                      >
                        <Pencil className="mr-1 size-3.5" />
                        Edit
                      </Button>
                      {service.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7.5 px-2 text-xs text-amber-600 hover:text-amber-700"
                          onClick={(e) => openDeactivate(service, e)}
                          title="Stop offering service"
                        >
                          <Power className="size-3.5" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7.5 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                          onClick={(e) => openReactivate(service, e)}
                          title="Reactivate service"
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                  <th className="px-5 py-3.5">Healthcare Service</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Satisfaction Index</th>
                  <th className="px-4 py-3.5">Rating Score</th>
                  <th className="px-4 py-3.5">Feedback Volume</th>
                  <th className="px-4 py-3.5">Clinics Offering</th>
                  <th className="px-5 py-3.5 text-right">
                    Operational Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {filteredServices.map((service) => {
                  const Icon = getServiceIcon(service.name);
                  const hasFeedback = service.totalFeedback > 0;
                  const isHigh = service.satisfactionRate >= 75 && hasFeedback;
                  const isLow = service.satisfactionRate < 60 && hasFeedback;

                  return (
                    <tr
                      key={service.id}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/services/${service.id}`)
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <span className="text-foreground hover:text-primary block text-sm font-bold transition-colors">
                              {service.name}
                            </span>
                            <span className="text-muted-foreground block max-w-xs truncate text-[11px]">
                              {service.description || "Clinical service"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            service.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "border-border bg-muted text-muted-foreground border",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              service.isActive
                                ? "animate-pulse bg-emerald-500"
                                : "bg-muted-foreground",
                            )}
                          />
                          {service.isActive ? "Active" : "Stopped"}
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
                            {hasFeedback ? `${service.satisfactionRate}%` : "—"}
                          </span>
                          {hasFeedback && (
                            <div className="w-20">
                              <SatisfactionBar
                                positive={service.positive}
                                neutral={service.neutral}
                                negative={service.negative}
                                showLegend={false}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <span className="text-foreground font-bold">
                          {hasFeedback ? service.avgScore.toFixed(1) : "—"}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {" "}
                          / 7
                        </span>
                      </td>

                      <td className="text-foreground px-4 py-3.5 font-mono font-semibold">
                        {service.totalFeedback.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                          <Building2 className="text-primary size-3" />
                          {service.branchesCount} Locations
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={(e) => openEdit(service, e)}
                            >
                              <Pencil className="size-3.5" />
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

      {/* 3. CRUD Modals & Dialogs */}
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-name"
                      className="text-foreground text-xs font-semibold"
                    >
                      Service / Department Name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="service-name"
                      required
                      placeholder="e.g. Laboratory & Diagnostic Testing"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={Boolean(fieldErrors.name?.length)}
                    />
                    <FormAlert messages={fieldErrors.name} compact />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-description"
                      className="text-foreground text-xs font-semibold"
                    >
                      Clinical Description / Scope
                    </Label>
                    <textarea
                      id="service-description"
                      rows={3}
                      placeholder="Briefly describe the clinical service scope for patient review forms…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-input placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border bg-transparent p-2.5 text-xs outline-none focus:ring-2"
                    />
                    <FormAlert messages={fieldErrors.description} compact />
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
                          <Activity className="size-3.5" />
                          <span>Save Service</span>
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
                      ? `"${dialog.service.name}" will stop appearing on patient feedback forms. Historical feedback data and branch linkages are preserved.`
                      : `"${dialog.service.name}" will resume accepting patient feedback across all clinical branches it was previously linked to.`}
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
                          ? "Stop Offering"
                          : "Reactivate Service"}
                      </span>
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
