"use client";

import * as React from "react";

import { AlertCircle, HeartPulse } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { BranchData } from "@/features/branches/actions";
import { useFeedbackFlow } from "@/features/feedback/components/use-feedback-flow";
import { StepIndicator } from "@/features/feedback/components/form/step-indicator";
import { FeedbackSuccessScreen } from "@/features/feedback/components/feedback-success-screen";
import { PhoneStep } from "@/features/feedback/components/steps/phone-step";
import { BranchStep } from "@/features/feedback/components/steps/branch-step";
import { ServiceStep } from "@/features/feedback/components/steps/service-step";
import { RatingStep } from "@/features/feedback/components/steps/rating-step";

interface FeedbackFormProps {
  initialBranches?: BranchData[];
}

export function PatientFeedbackForm({
  initialBranches = [],
}: FeedbackFormProps) {
  const { state, actions } = useFeedbackFlow(initialBranches);

  const stepHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const isFirstRender = React.useRef(true);

  // Announce step changes / confirmation by moving focus to the step heading.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (state.submissionId) {
      successHeadingRef.current?.focus();
    } else {
      stepHeadingRef.current?.focus();
    }
  }, [state.step, state.submissionId]);

  if (state.submissionId) {
    const branchName =
      state.branches.find((branch) => branch.id === state.branchId)?.name ?? "";
    const serviceName =
      state.services.find((service) => service.id === state.serviceId)?.name ??
      "";
    return (
      <FeedbackSuccessScreen
        headingRef={successHeadingRef}
        submissionId={state.submissionId}
        branchName={branchName}
        serviceName={serviceName}
        onReset={actions.resetFlow}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <div className="mb-6 space-y-3 text-center sm:mb-8">
        <h1 className="inline-flex items-center justify-center gap-2 text-xl font-semibold">
          <HeartPulse
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          HealSync Patient Care
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          We value your health and experience. Please share your feedback to
          help us serve you better.
        </p>
        <StepIndicator currentStep={state.step} onSelect={actions.goToStep} />
      </div>

      {state.topError ? (
        <Alert
          variant="destructive"
          className="animate-in fade-in mb-6 duration-200"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{state.topError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="border-border/80 bg-card rounded-xl border shadow-lg">
        {state.step === 1 ? (
          <PhoneStep
            headingRef={stepHeadingRef}
            value={state.phoneNumber}
            errors={state.fieldErrors.phoneNumber ?? []}
            onChange={actions.changePhone}
            onBlur={actions.validatePhoneOnBlur}
            onSubmit={actions.submitPhone}
          />
        ) : null}
        {state.step === 2 ? (
          <BranchStep
            headingRef={stepHeadingRef}
            branches={state.branches}
            status={state.branchesStatus}
            error={state.branchesError}
            selectedBranchId={state.branchId}
            search={state.branchSearch}
            onSearchChange={actions.changeSearch}
            onSelect={actions.selectBranch}
            onRetry={actions.retryLoadBranches}
            onBack={() => actions.goToStep(1)}
          />
        ) : null}
        {state.step === 3 ? (
          <ServiceStep
            headingRef={stepHeadingRef}
            services={state.services}
            status={state.servicesStatus}
            error={state.servicesError}
            selectedServiceId={state.serviceId}
            branchName={
              state.branches.find((branch) => branch.id === state.branchId)
                ?.name ?? ""
            }
            onSelect={actions.selectService}
            onRetry={actions.retryLoadServices}
            onChooseDifferentBranch={actions.chooseDifferentBranch}
            onBack={() => actions.goToStep(2)}
          />
        ) : null}
        {state.step === 4 ? (
          <RatingStep
            headingRef={stepHeadingRef}
            rating={state.rating}
            comment={state.comment}
            ratingErrors={state.fieldErrors.rating ?? []}
            commentErrors={state.fieldErrors.comment ?? []}
            branchName={
              state.branches.find((branch) => branch.id === state.branchId)
                ?.name ?? ""
            }
            serviceName={
              state.services.find((service) => service.id === state.serviceId)
                ?.name ?? ""
            }
            isSubmitting={state.isSubmitting}
            onRatingSelect={actions.selectRating}
            onCommentChange={actions.changeComment}
            onBack={() => actions.goToStep(3)}
            onSubmit={actions.submitRating}
          />
        ) : null}
      </div>
    </div>
  );
}
