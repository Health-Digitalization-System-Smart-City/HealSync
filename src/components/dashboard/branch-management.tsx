"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  Building2,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/form-alert";
import { BranchCard } from "@/components/dashboard/branch-card";
import {
  createBranch,
  setBranchActive,
  setBranchServices,
  updateBranch,
} from "@/features/branches/actions";
import type { BranchOverview } from "@/lib/analytics/db";

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
  | null;

type BranchesViewProps = {
  branches: BranchOverview[];
  /** All services (active + inactive) for the per-branch availability editor. */
  services: ServiceOption[];
  /** Currently offered service ids per branch (active links only). */
  branchServiceIds: Record<string, string[]>;
  canCreate: boolean;
  canUpdate: boolean;
};

export function BranchesView({
  branches,
  services,
  branchServiceIds,
  canCreate,
  canUpdate,
}: BranchesViewProps) {
  const router = useRouter();

  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  // Create / edit form state
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");

  // Services dialog selection
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>(
    [],
  );

  function openCreate() {
    setName("");
    setCode("");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "create" });
  }

  function openEdit(branch: BranchOverview) {
    setName(branch.name);
    setCode(branch.code ?? "");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "edit", branch });
  }

  function openServices(branch: BranchOverview) {
    setSelectedServiceIds(branchServiceIds[branch.id] ?? []);
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "services", branch });
  }

  function openDeactivate(branch: BranchOverview) {
    setErrorMessage(null);
    setDialog({ type: "deactivate", branch });
  }

  function openReactivate(branch: BranchOverview) {
    setErrorMessage(null);
    setDialog({ type: "reactivate", branch });
  }

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
    if (!dialog || (dialog.type !== "deactivate" && dialog.type !== "reactivate")) {
      return;
    }
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

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  const dialogTitle =
    dialog?.type === "create"
      ? "Add a new clinic branch"
      : dialog?.type === "edit"
        ? `Edit ${dialog.branch.name}`
        : dialog?.type === "services"
          ? `Services at ${dialog.branch.name}`
          : dialog?.type === "deactivate"
            ? `Shut down ${dialog.branch.name}?`
            : dialog?.type === "reactivate"
              ? `Reactivate ${dialog.branch.name}?`
              : "";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">All branches</h2>
          <p className="text-xs text-slate-500">
            {branches.length} locations · ranked by satisfaction
          </p>
        </div>
        {canCreate ? (
          <Button onClick={openCreate} className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            New branch
          </Button>
        ) : null}
      </div>

      {/* Branch grid */}
      {branches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No branches are configured yet.
          </p>
          {canCreate ? (
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-1.5">
              <Plus className="size-4" />
              Add your first branch
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch, index) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              rank={index + 1}
              actions={
                canUpdate ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => openEdit(branch)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => openServices(branch)}
                    >
                      <Link2 className="size-3.5" />
                      Services
                    </Button>
                    {branch.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-amber-700 hover:text-amber-800"
                        onClick={() => openDeactivate(branch)}
                      >
                        <Power className="size-3.5" />
                        Shut down
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-emerald-700 hover:text-emerald-800"
                        onClick={() => openReactivate(branch)}
                      >
                        <RotateCcw className="size-3.5" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
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
              <h2 className="text-foreground text-lg font-bold">{dialogTitle}</h2>
              <Dialog.Close
                aria-label="Close dialog"
                className="text-muted-foreground hover:bg-muted rounded-lg p-1"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="mt-4">
              {errorMessage ? (
                <FormAlert messages={errorMessage} className="mb-4" />
              ) : null}

              {dialog?.type === "create" || dialog?.type === "edit" ? (
                <form
                  onSubmit={dialog.type === "create" ? handleCreate : handleEdit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="branch-name" className="text-xs font-semibold">
                      Branch name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="branch-name"
                      required
                      placeholder="e.g. Merkato Clinic"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={Boolean(fieldErrors.name?.length)}
                    />
                    <FormAlert messages={fieldErrors.name} compact />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="branch-code" className="text-xs font-semibold">
                      Branch code
                    </Label>
                    <Input
                      id="branch-code"
                      placeholder="e.g. BR-02"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      error={Boolean(fieldErrors.code?.length)}
                    />
                    <p className="text-muted-foreground text-[11px]">
                      Optional short identifier shown to patients. Must be unique.
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
                    <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Building2 className="size-3.5" />
                          Save branch
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : null}

              {dialog?.type === "services" ? (
                <form onSubmit={handleSaveServices} className="space-y-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Choose which services patients can select for this branch.
                    Deactivated services can be reactivated from the Services page.
                  </p>

                  {services.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-xs">
                      No services exist yet. Create services on the Services page
                      first, then link them here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {services.map((service) => {
                        const checked = selectedServiceIds.includes(service.id);
                        return (
                          <label
                            key={service.id}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                              checked
                                ? "border-teal-300 bg-teal-50/60"
                                : "border-slate-200 hover:bg-slate-50"
                            } ${!service.isActive ? "opacity-60" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="size-4 accent-teal-600"
                              checked={checked}
                              disabled={!service.isActive}
                              onChange={() => toggleService(service.id)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-800">
                                {service.name}
                              </span>
                              {service.description ? (
                                <span className="text-muted-foreground block truncate text-xs">
                                  {service.description}
                                </span>
                              ) : null}
                            </span>
                            {!service.isActive ? (
                              <Badge variant="outline" className="text-[10px]">
                                Inactive
                              </Badge>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  )}

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
                          Saving…
                        </>
                      ) : (
                        <>
                          <Link2 className="size-3.5" />
                          Save services
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : null}

              {dialog?.type === "deactivate" || dialog?.type === "reactivate" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {dialog.type === "deactivate"
                      ? `"${dialog.branch.name}" will stop appearing in the patient feedback form. Historical feedback and analytics are kept, and the branch can be reactivated anytime.`
                      : `"${dialog.branch.name}" will become visible to patients again and its previously linked services will be restored.`}
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
                          ? "gap-1.5 bg-amber-600 hover:bg-amber-700"
                          : "gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      }
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : dialog.type === "deactivate" ? (
                        <Power className="size-3.5" />
                      ) : (
                        <RotateCcw className="size-3.5" />
                      )}
                      {dialog.type === "deactivate"
                        ? "Shut down branch"
                        : "Reactivate branch"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
