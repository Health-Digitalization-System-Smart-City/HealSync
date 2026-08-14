"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

import { FormField } from "@/features/feedback/components/form/form-field";
import { StepHeader } from "@/features/feedback/components/steps/step-header";

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
          title="Phone Number"
          description="Enter your phone number to proceed with your feedback."
        />
        <FormField
          id="phoneNumber"
          label="Patient Phone Number"
          required
          errors={errors}
          hint="Your phone number is kept confidential and only used for verified patient feedback records."
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 0912345678 or +251912345678"
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
          Continue to Branch Selection
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
