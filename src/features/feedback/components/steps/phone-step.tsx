"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

import { FormField } from "@/features/feedback/components/form/form-field";
import { StepHeader } from "@/features/feedback/components/steps/step-header";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

export function PhoneStep({
  headingRef,
  value,
  errors,
  onChange,
  onBlur,
  onSubmit,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  value: string;
  errors: string[];
  onChange: (value: string) => void;
  onBlur: () => void;
  onSubmit: () => void;
}) {
  const { t } = useFeedbackI18n();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="space-y-6 p-5 sm:p-6">
        <StepHeader
          headingRef={headingRef}
          icon={Phone}
          title={t("phoneTitle")}
          description={t("phoneDescription")}
        />
        <FormField
          id="phoneNumber"
          label={t("phoneLabel")}
          required
          errors={errors}
          hint={t("phoneHint")}
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            error={errors.length > 0}
            className="h-12 text-base"
            autoFocus
          />
        </FormField>
      </div>
      <CardFooter className="px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
        <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto">
          {t("continueBranch")}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </CardFooter>
    </form>
  );
}
