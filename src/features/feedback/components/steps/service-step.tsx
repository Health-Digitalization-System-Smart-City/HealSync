"use client";

import * as React from "react";

import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

import type { ServiceData } from "@/features/services/actions";
import type { LoadStatus } from "@/features/feedback/components/use-feedback-flow";
import { SelectionCard } from "@/features/feedback/components/form/selection-card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/features/feedback/components/form/form-states";
import { StepHeader } from "@/features/feedback/components/steps/step-header";

export function ServiceStep({
  headingRef,
  services,
  status,
  error,
  selectedServiceId,
  branchName,
  onSelect,
  onRetry,
  onChooseDifferentBranch,
  onBack,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  services: ServiceData[];
  status: LoadStatus;
  error: string | null;
  selectedServiceId: string;
  branchName: string;
  onSelect: (serviceId: string) => void;
  onRetry: () => void;
  onChooseDifferentBranch: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="space-y-6 p-5 sm:p-6">
        <StepHeader
          headingRef={headingRef}
          icon={Stethoscope}
          title="Select Service"
          description={
            <>
              Select the service or department you visited at{" "}
              <span className="text-foreground font-semibold">
                {branchName}
              </span>
              .
            </>
          }
          onBack={onBack}
        />

        {status === "loading" ? (
          <LoadingState
            label="Loading available services…"
            hint="Fetching the services offered at this branch."
          />
        ) : status === "error" ? (
          <ErrorState
            title="Couldn't load services"
            message={
              error ??
              "There was a problem loading services for this branch. Please try again."
            }
            onRetry={onRetry}
          />
        ) : services.length === 0 ? (
          <EmptyState
            title="No services available at this branch"
            message="This branch doesn't offer any services right now. Please choose a different branch or try again later."
            actionLabel="Choose a different branch"
            onAction={onChooseDifferentBranch}
          />
        ) : (
          <fieldset>
            <legend className="sr-only">
              Select the service or department you visited
            </legend>
            <div className="grid grid-cols-1 gap-3">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <SelectionCard
                    key={service.id}
                    name="service"
                    value={service.id}
                    selected={isSelected}
                    onChange={() => onSelect(service.id)}
                    selectedClass="border-primary bg-primary/10 ring-primary/20 ring-2"
                  >
                    <div
                      className={cn(
                        "rounded-md p-2.5",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground text-base font-semibold">
                        {service.name}
                      </div>
                      {service.description ? (
                        <div className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                          {service.description}
                        </div>
                      ) : null}
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0",
                        isSelected ? "text-primary" : "text-transparent",
                      )}
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </SelectionCard>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    </div>
  );
}
