"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  Activity,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/form-alert";
import { ServiceCard } from "@/components/dashboard/service-card";
import {
  createService,
  setServiceActive,
  updateService,
} from "@/features/services/actions";
import type { ServiceOverview } from "@/lib/analytics/db";

type DialogState =
  | { type: "create" }
  | { type: "edit"; service: ServiceOverview }
  | { type: "deactivate"; service: ServiceOverview }
  | { type: "reactivate"; service: ServiceOverview }
  | null;

type ServicesViewProps = {
  services: ServiceOverview[];
  canCreate: boolean;
  canUpdate: boolean;
};

export function ServicesView({
  services,
  canCreate,
  canUpdate,
}: ServicesViewProps) {
  const router = useRouter();

  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  function openCreate() {
    setName("");
    setDescription("");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "create" });
  }

  function openEdit(service: ServiceOverview) {
    setName(service.name);
    setDescription(service.description ?? "");
    setErrorMessage(null);
    setFieldErrors({});
    setDialog({ type: "edit", service });
  }

  function openDeactivate(service: ServiceOverview) {
    setErrorMessage(null);
    setDialog({ type: "deactivate", service });
  }

  function openReactivate(service: ServiceOverview) {
    setErrorMessage(null);
    setDialog({ type: "reactivate", service });
  }

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
    ) {
      return;
    }
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
      ? "Add a new service"
      : dialog?.type === "edit"
        ? `Edit ${dialog.service.name}`
        : dialog?.type === "deactivate"
          ? `Stop offering ${dialog.service.name}?`
          : dialog?.type === "reactivate"
            ? `Reactivate ${dialog.service.name}?`
            : "";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">All services</h2>
          <p className="text-xs text-slate-500">
            {services.length} departments · ranked by satisfaction
          </p>
        </div>
        {canCreate ? (
          <Button onClick={openCreate} className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            New service
          </Button>
        ) : null}
      </div>

      {/* Service grid */}
      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No services are configured yet.
          </p>
          {canCreate ? (
            <Button
              onClick={openCreate}
              variant="outline"
              className="mt-4 gap-1.5"
            >
              <Plus className="size-4" />
              Add your first service
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              rank={index + 1}
              actions={
                canUpdate ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    {service.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-amber-700 hover:text-amber-800"
                        onClick={() => openDeactivate(service)}
                      >
                        <Power className="size-3.5" />
                        Stop offering
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs text-emerald-700 hover:text-emerald-800"
                        onClick={() => openReactivate(service)}
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
              {errorMessage ? (
                <FormAlert messages={errorMessage} className="mb-4" />
              ) : null}

              {dialog?.type === "create" || dialog?.type === "edit" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-name"
                      className="text-xs font-semibold"
                    >
                      Service name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="service-name"
                      required
                      placeholder="e.g. Cardiology"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      error={Boolean(fieldErrors.name?.length)}
                    />
                    <FormAlert messages={fieldErrors.name} compact />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="service-description"
                      className="text-xs font-semibold"
                    >
                      Description
                    </Label>
                    <textarea
                      id="service-description"
                      rows={3}
                      placeholder="Briefly describe the service for patients…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-input placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border bg-transparent p-2 text-xs outline-none focus:ring-2"
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
                          Saving…
                        </>
                      ) : (
                        <>
                          <Activity className="size-3.5" />
                          Save service
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : null}

              {dialog?.type === "deactivate" ||
              dialog?.type === "reactivate" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {dialog.type === "deactivate"
                      ? `"${dialog.service.name}" will stop appearing in the patient feedback form. Historical feedback and analytics are kept, and the service can be reactivated anytime.`
                      : `"${dialog.service.name}" will become available again on every branch it was previously linked to.`}
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
                        ? "Stop offering"
                        : "Reactivate service"}
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
