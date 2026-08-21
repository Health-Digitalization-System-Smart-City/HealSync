"use client";

import * as React from "react";

import { Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { BranchData } from "@/features/branches/actions";
import type { LoadStatus } from "@/features/feedback/components/use-feedback-flow";
import { SelectionCard } from "@/features/feedback/components/form/selection-card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/features/feedback/components/form/form-states";
import { StepHeader } from "@/features/feedback/components/steps/step-header";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

export function BranchStep({
  headingRef,
  branches,
  status,
  error,
  selectedBranchId,
  search,
  onSearchChange,
  onSelect,
  onRetry,
  onBack,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  branches: BranchData[];
  status: LoadStatus;
  error: string | null;
  selectedBranchId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (branchId: string) => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useFeedbackI18n();
  const query = search.trim().toLowerCase();
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(query) ||
      (branch.code ?? "").toLowerCase().includes(query),
  );

  return (
    <div>
      <div className="space-y-6 p-5 sm:p-6">
        <StepHeader
          headingRef={headingRef}
          icon={Building2}
          title={t("branchTitle")}
          description={t("branchDescription")}
          onBack={onBack}
        />

        {status === "loading" ? (
          <LoadingState label={t("loadingBranches")} />
        ) : status === "error" ? (
          <ErrorState
            title={t("branchLoadError")}
            message={error ?? t("branchLoadErrorText")}
            onRetry={onRetry}
          />
        ) : branches.length === 0 ? (
          <EmptyState
            title={t("noBranches")}
            message={t("noBranchesText")}
            actionLabel={t("refresh")}
            onAction={onRetry}
          />
        ) : (
          <fieldset>
            <legend className="sr-only">
              Choose the clinic branch you visited
            </legend>
            {branches.length > 5 ? (
              <div className="mb-3 space-y-2">
                <Label htmlFor="branchSearch" className="sr-only">
                  {t("searchBranches")}
                </Label>
                <Input
                  id="branchSearch"
                  type="search"
                  placeholder={t("searchBranches")}
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="h-11 text-base"
                />
              </div>
            ) : null}

            {filteredBranches.length === 0 ? (
              <EmptyState
                title={t("noMatchingBranches")}
                message={`${t("noMatchingBranches")}: “${search}”.`}
              />
            ) : (
              <div className="grid max-h-[min(52vh,420px)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredBranches.map((branch) => {
                  const isSelected = selectedBranchId === branch.id;
                  return (
                    <SelectionCard
                      key={branch.id}
                      name="branch"
                      value={branch.id}
                      selected={isSelected}
                      onChange={() => onSelect(branch.id)}
                      selectedClass="border-primary bg-primary/10 ring-primary/20 ring-2"
                    >
                      <div
                        className={cn(
                          "rounded-md p-2",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Building2 className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate text-sm font-semibold">
                          {branch.name}
                        </div>
                        {branch.code ? (
                          <div className="text-muted-foreground font-mono text-xs">
                            Code: {branch.code}
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
                          "h-5 w-5 shrink-0",
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
            )}
          </fieldset>
        )}
      </div>
    </div>
  );
}
