"use client";

import * as React from "react";

import Link from "next/link";
import {
  CheckCircle2,
  HeartPulse,
  House,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { FormAlert } from "@/components/form-alert";
import type { BranchData } from "@/features/branches/actions";
import { useFeedbackFlow } from "@/features/feedback/components/use-feedback-flow";
import { StepIndicator } from "@/features/feedback/components/form/step-indicator";
import { FeedbackSuccessScreen } from "@/features/feedback/components/feedback-success-screen";
import { PhoneStep } from "@/features/feedback/components/steps/phone-step";
import { BranchStep } from "@/features/feedback/components/steps/branch-step";
import { ServiceStep } from "@/features/feedback/components/steps/service-step";
import { RatingStep } from "@/features/feedback/components/steps/rating-step";
import {
  FeedbackLanguageProvider,
  useFeedbackI18n,
} from "@/features/feedback/components/feedback-i18n";
import { LanguageSelector } from "@/features/feedback/components/language-selector";

interface FeedbackFormProps {
  initialBranches?: BranchData[];
}

export function PatientFeedbackForm({
  initialBranches = [],
}: FeedbackFormProps) {
  return (
    <FeedbackLanguageProvider>
      <PatientFeedbackFormContent initialBranches={initialBranches} />
    </FeedbackLanguageProvider>
  );
}

function PatientFeedbackFormContent({ initialBranches }: FeedbackFormProps) {
  const { locale, t } = useFeedbackI18n();
  const { state, actions } = useFeedbackFlow(initialBranches, locale);

  const stepHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const isFirstRender = React.useRef(true);

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
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <FeedbackSuccessScreen
            headingRef={successHeadingRef}
            submissionId={state.submissionId}
            branchName={branchName}
            serviceName={serviceName}
            onReset={actions.resetFlow}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-6">
        <aside className="surface-card rounded-[1.5rem] p-4 sm:p-6 lg:sticky lg:top-24 lg:rounded-[2rem] lg:p-8">
          <div className="flex items-center gap-2.5 lg:mb-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-700/20">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                {t("patientExperience")}
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t("feedback")}
              </h1>
            </div>
            <span className="ml-auto rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 lg:hidden">
              {t("aboutMinute")}
            </span>
            <LanguageSelector />
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <House className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{t("home")}</span>
              <span className="sr-only sm:hidden">{t("home")}</span>
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-3.5 lg:p-4">
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              {t("intro")}
            </p>
          </div>

          <div className="mt-6 hidden space-y-4 lg:block">
            {[
              {
                icon: Sparkles,
                title: t("fastClear"),
                text: t("fastClearText"),
              },
              {
                icon: ShieldCheck,
                title: t("private"),
                text: t("privateText"),
              },
              {
                icon: Star,
                title: t("perspective"),
                text: t("perspectiveText"),
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-6">
            {[t("quickSurvey"), t("noAccount"), t("secure")].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                <CheckCircle2
                  className="h-3.5 w-3.5 text-teal-700"
                  aria-hidden
                />
                {item}
              </span>
            ))}
          </div>
        </aside>

        <div className="surface-card rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
          <div className="mb-6 space-y-4 text-center sm:mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {t("experienceMatters")}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600">
              {t("experienceIntro")}
            </p>
            <StepIndicator
              currentStep={state.step}
              onSelect={actions.goToStep}
            />
          </div>

          {state.topError ? (
            <FormAlert messages={state.topError} className="mb-6" />
          ) : null}

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC]">
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
                  state.services.find(
                    (service) => service.id === state.serviceId,
                  )?.name ?? ""
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
      </div>
    </div>
  );
}
