"use client";

import * as React from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { getBranches, type BranchData } from "@/features/branches/actions";
import { submitFeedback } from "@/features/feedback/actions";
import { getServices, type ServiceData } from "@/features/services/actions";
import {
  FeedbackRatingEnum,
  type FeedbackRating,
} from "@/lib/validation/feedback";

interface RatingOption {
  value: FeedbackRating;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  selectedBgClass: string;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    value: "VERY_SATISFIED",
    label: "Very Satisfied",
    description: "Exceptional service and care",
    icon: Sparkles,
    colorClass: "text-emerald-500 border-emerald-200 dark:border-emerald-900",
    selectedBgClass:
      "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20",
  },
  {
    value: "SATISFIED",
    label: "Satisfied",
    description: "Met all expectations",
    icon: Smile,
    colorClass: "text-green-500 border-green-200 dark:border-green-900",
    selectedBgClass:
      "bg-green-500/10 border-green-500 ring-2 ring-green-500/20",
  },
  {
    value: "MOSTLY_SATISFIED",
    label: "Mostly Satisfied",
    description: "Good overall, minor issues",
    icon: ThumbsUp,
    colorClass: "text-teal-500 border-teal-200 dark:border-teal-900",
    selectedBgClass: "bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20",
  },
  {
    value: "GOOD",
    label: "Good",
    description: "Decent experience",
    icon: Smile,
    colorClass: "text-cyan-500 border-cyan-200 dark:border-cyan-900",
    selectedBgClass: "bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20",
  },
  {
    value: "NEUTRAL",
    label: "Neutral",
    description: "Neither good nor bad",
    icon: Meh,
    colorClass: "text-amber-500 border-amber-200 dark:border-amber-900",
    selectedBgClass:
      "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20",
  },
  {
    value: "NOT_SATISFIED",
    label: "Not Satisfied",
    description: "Fell short of expectations",
    icon: ThumbsDown,
    colorClass: "text-orange-500 border-orange-200 dark:border-orange-900",
    selectedBgClass:
      "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20",
  },
  {
    value: "POOR",
    label: "Poor",
    description: "Unsatisfactory experience",
    icon: Frown,
    colorClass: "text-rose-500 border-rose-200 dark:border-rose-900",
    selectedBgClass: "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20",
  },
  {
    value: "VERY_POOR",
    label: "Very Poor",
    description: "Severe issues encountered",
    icon: AlertCircle,
    colorClass: "text-red-500 border-red-200 dark:border-red-900",
    selectedBgClass: "bg-red-500/10 border-red-500 ring-2 ring-red-500/20",
  },
];

interface FeedbackFormProps {
  initialBranches?: BranchData[];
}

export function PatientFeedbackForm({
  initialBranches = [],
}: FeedbackFormProps) {
  // Form step state: 1: Phone, 2: Branch, 3: Service, 4: Rating & Comment
  const [step, setStep] = React.useState<number>(1);

  // Form input states
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>("");
  const [rating, setRating] = React.useState<FeedbackRating | "">("");
  const [comment, setComment] = React.useState<string>("");

  // Loaded data states
  const [branches, setBranches] = React.useState<BranchData[]>(initialBranches);
  const [isLoadingBranches, setIsLoadingBranches] = React.useState<boolean>(
    initialBranches.length === 0,
  );
  const [services, setServices] = React.useState<ServiceData[]>([]);
  const [isLoadingServices, setIsLoadingServices] =
    React.useState<boolean>(false);

  // UI state (loading, errors, success)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [submissionSuccess, setSubmissionSuccess] =
    React.useState<boolean>(false);
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);

  // Search filter for branches
  const [branchSearch, setBranchSearch] = React.useState<string>("");

  // 1. Fetch Branches on mount if not provided via props
  React.useEffect(() => {
    if (initialBranches.length === 0) {
      let isMounted = true;
      getBranches()
        .then((res) => {
          if (!isMounted) return;
          if (res.success) {
            setBranches(res.data);
          } else {
            setErrorMessage(res.error.message);
          }
        })

        .finally(() => {
          if (isMounted) setIsLoadingBranches(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [initialBranches]);

  // 2. Fetch Services whenever selectedBranchId changes
  React.useEffect(() => {
    if (!selectedBranchId) return;

    let isMounted = true;

    getServices({ branchId: selectedBranchId })
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setServices(res.data);
          // Reset selected service if current service is no longer in the loaded list
          if (
            selectedServiceId &&
            !res.data.some((s) => s.id === selectedServiceId)
          ) {
            setSelectedServiceId("");
          }
        } else {
          setServices([]);
          setErrorMessage(res.error.message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingServices(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]);

  // Handle Step 1 Validation (Phone)
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setFieldErrors({ phoneNumber: ["Phone number is required."] });
      return;
    }

    const phoneRegex = /^(\+251|0)?[79]\d{8}$|^(\+\d{1,3})?\d{8,14}$/;
    if (!phoneRegex.test(cleanPhone.replace(/[\s-]/g, ""))) {
      setFieldErrors({
        phoneNumber: [
          "Please enter a valid phone number (e.g. 0912345678 or +251912345678).",
        ],
      });
      return;
    }

    setStep(2);
  };

  // Handle Step 2 Validation (Branch)
  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    // Reset the dependent service list and show the loading state now (the
    // fetch effect below refreshes it for the newly selected branch).
    setServices([]);
    setSelectedServiceId("");
    setIsLoadingServices(true);
    setFieldErrors((prev) => ({ ...prev, branchId: [] }));
    setErrorMessage(null);
    setStep(3);
  };

  // Handle Step 3 Validation (Service)
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setFieldErrors((prev) => ({ ...prev, serviceId: [] }));
    setErrorMessage(null);
    setStep(4);
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!rating) {
      setFieldErrors({ rating: ["Please select a rating option."] });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitFeedback({
        phoneNumber,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        rating: rating as FeedbackRating,
        comment: comment.trim() || undefined,
      });

      if (res.success) {
        setSubmissionSuccess(true);
        setSubmissionId(res.data.id);
      } else {
        setErrorMessage(res.error.message);
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhoneNumber("");
    setSelectedBranchId("");
    setSelectedServiceId("");
    setRating("");
    setComment("");
    setErrorMessage(null);
    setFieldErrors({});
    setSubmissionSuccess(false);
    setSubmissionId(null);
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(branchSearch.toLowerCase())),
  );

  // Render Success Screen
  if (submissionSuccess) {
    return (
      <Card className="from-card mx-auto w-full max-w-lg border-emerald-500/20 bg-gradient-to-b to-emerald-500/5 shadow-xl">
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="animate-in zoom-in-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 duration-300 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <Badge
            variant="outline"
            className="mx-auto mb-2 gap-1 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400"
          >
            Feedback Submitted
          </Badge>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Thank You for Your Feedback!
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-base">
            Your response helps us continuously improve the quality of care
            across our clinic branches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 text-sm">
          <div className="bg-background/80 space-y-2 rounded-lg border p-4">
            <div className="text-muted-foreground flex items-center justify-between border-b pb-2">
              <span>Reference ID</span>
              <span className="text-foreground font-mono text-xs font-medium">
                {submissionId ? submissionId.slice(0, 12) : "N/A"}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Branch</span>
              <span className="text-foreground font-medium">
                {selectedBranch?.name || "Selected Branch"}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Service</span>
              <span className="text-foreground font-medium">
                {selectedService?.name || "Selected Service"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-8">
          <Button
            onClick={resetForm}
            className="h-11 w-full gap-2 text-base font-medium shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Submit Another Response
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Progress & Header Bar */}
      <div className="mb-8 space-y-3 text-center">
        <div className="text-primary inline-flex items-center justify-center gap-2 text-xl font-semibold">
          <HeartPulse className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <span>HealSync Patient Care</span>
        </div>
        <p className="text-muted-foreground mx-auto max-w-md text-sm">
          We value your health and experience. Please share your feedback to
          help us serve you better.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <button
                type="button"
                onClick={() => {
                  if (i < step) setStep(i);
                }}
                disabled={i > step}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  step === i
                    ? "bg-primary text-primary-foreground ring-primary/20 shadow-md ring-4"
                    : step > i
                      ? "cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                aria-label={`Go to step ${i}`}
              >
                {step > i ? <CheckCircle2 className="h-4 w-4" /> : i}
              </button>
              {i < 4 && (
                <div
                  className={`h-1 w-8 rounded-full transition-all ${
                    step > i ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-muted-foreground text-xs font-medium">
          {step === 1 && "Step 1 of 4: Phone Number"}
          {step === 2 && "Step 2 of 4: Branch Selection"}
          {step === 3 && "Step 3 of 4: Service Selection"}
          {step === 4 && "Step 4 of 4: Rating & Feedback"}
        </div>
      </div>

      {/* Top Error Alert */}
      {errorMessage && (
        <Alert
          variant="destructive"
          className="animate-in fade-in mb-6 duration-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card className="border-border/80 shadow-lg">
        {/* STEP 1: Phone Number Input */}
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Phone className="text-primary h-5 w-5" />
                Phone Number
              </CardTitle>
              <CardDescription>
                Enter your phone number to proceed with your feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">
                  Patient Phone Number{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g. 0912345678 or +251912345678"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phoneNumber) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          phoneNumber: [],
                        }));
                      }
                    }}
                    error={Boolean(fieldErrors.phoneNumber?.length)}
                    className="h-11 pl-10 text-base"
                    autoFocus
                  />
                </div>
                {fieldErrors.phoneNumber?.map((err, idx) => (
                  <p
                    key={idx}
                    className="text-destructive mt-1 text-xs font-medium"
                  >
                    {err}
                  </p>
                ))}
                <p className="text-muted-foreground text-xs">
                  Your phone number is kept confidential and only used for
                  verified patient feedback records.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 sm:w-auto"
              >
                Continue to Branch Selection
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}

        {/* STEP 2: Branch Selection */}
        {step === 2 && (
          <div>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="text-primary h-5 w-5" />
                  Select Branch
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <CardDescription>
                Choose the clinic branch location you visited.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {isLoadingBranches ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 py-12">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading clinic branches...</p>
                </div>
              ) : branches.length === 0 ? (
                <div className="text-muted-foreground space-y-2 py-8 text-center">
                  <p>No active branches found.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsLoadingBranches(true);
                      getBranches().then((res) => {
                        if (res.success) setBranches(res.data);
                        setIsLoadingBranches(false);
                      });
                    }}
                  >
                    Retry Loading
                  </Button>
                </div>
              ) : (
                <>
                  {branches.length > 5 && (
                    <Input
                      type="search"
                      placeholder="Search branch name or code..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="mb-3"
                    />
                  )}
                  <div className="grid max-h-[360px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                    {filteredBranches.map((branch) => {
                      const isSelected = selectedBranchId === branch.id;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => handleBranchSelect(branch.id)}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                              : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                          }`}
                        >
                          <div
                            className={`rounded-md p-2 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-foreground truncate text-sm font-semibold">
                              {branch.name}
                            </div>
                            {branch.code && (
                              <div className="text-muted-foreground font-mono text-xs">
                                Code: {branch.code}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {fieldErrors.branchId?.map((err, idx) => (
                <p
                  key={idx}
                  className="text-destructive mt-1 text-xs font-medium"
                >
                  {err}
                </p>
              ))}
            </CardContent>
          </div>
        )}

        {/* STEP 3: Service Selection */}
        {step === 3 && (
          <div>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Stethoscope className="text-primary h-5 w-5" />
                  Select Service / Department
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-muted-foreground gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <CardDescription>
                Select the service or department you visited at{" "}
                <span className="text-foreground font-semibold">
                  {selectedBranch?.name || "the selected branch"}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {isLoadingServices ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 py-12">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-sm">
                    Loading available services for branch...
                  </p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-muted-foreground space-y-3 py-8 text-center">
                  <p className="text-sm font-medium">
                    No services are currently configured for this branch.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(2)}
                  >
                    Choose a different branch
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {services.map((svc) => {
                    const isSelected = selectedServiceId === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => handleServiceSelect(svc.id)}
                        className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                        }`}
                      >
                        <div
                          className={`rounded-md p-2.5 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground text-base font-semibold">
                            {svc.name}
                          </div>
                          {svc.description && (
                            <div className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                              {svc.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="text-primary mt-1 h-5 w-5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {fieldErrors.serviceId?.map((err, idx) => (
                <p
                  key={idx}
                  className="text-destructive mt-1 text-xs font-medium"
                >
                  {err}
                </p>
              ))}
            </CardContent>
          </div>
        )}

        {/* STEP 4: Rating & Optional Text Feedback */}
        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="text-primary h-5 w-5" />
                  Rate Your Experience
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(3)}
                  className="text-muted-foreground gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <CardDescription>
                Providing feedback for{" "}
                <span className="text-foreground font-semibold">
                  {selectedService?.name}
                </span>{" "}
                at{" "}
                <span className="text-foreground font-semibold">
                  {selectedBranch?.name}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Rating selection grid */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Overall Rating <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {RATING_OPTIONS.map((opt) => {
                    const IconComponent = opt.icon;
                    const isSelected = rating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setRating(opt.value);
                          if (fieldErrors.rating) {
                            setFieldErrors((prev) => ({ ...prev, rating: [] }));
                          }
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? opt.selectedBgClass
                            : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
                        }`}
                      >
                        <div
                          className={`mb-1.5 rounded-full p-2 ${opt.colorClass}`}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <span className="text-foreground text-xs leading-tight font-semibold">
                          {opt.label}
                        </span>
                        <span className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.rating?.map((err, idx) => (
                  <p
                    key={idx}
                    className="text-destructive mt-1 text-xs font-medium"
                  >
                    {err}
                  </p>
                ))}
              </div>

              {/* Free-text comment */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="comment" className="text-sm font-medium">
                    Written Feedback{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <span className="text-muted-foreground font-mono text-xs">
                    {comment.length} / 1000
                  </span>
                </div>
                <Textarea
                  id="comment"
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell us what went well or what we could do better..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  error={Boolean(fieldErrors.comment?.length)}
                  className="resize-none text-sm"
                />
                {fieldErrors.comment?.map((err, idx) => (
                  <p
                    key={idx}
                    className="text-destructive mt-1 text-xs font-medium"
                  >
                    {err}
                  </p>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Back to Services
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !rating}
                className="w-full min-w-[160px] gap-2 font-semibold sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
