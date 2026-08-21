"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

const ROUTE_LABEL_KEYS = {
  dashboard: "overview",
  tasks: "tasksWorkflows",
  feedback: "patientFeedback",
  analytics: "analyticsIntelligence",
  branches: "clinicBranches",
  services: "medicalServices",
  users: "staffRoles",
  profile: "navProfile",
} as const;

export function DashboardBreadcrumbs() {
  const { t } = useFeedbackI18n();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // If on /dashboard exactly
  if (segments.length <= 1) {
    return (
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Home className="size-3.5" aria-hidden />
        <ChevronRight className="text-muted-foreground/60 size-3" aria-hidden />
        <span className="text-foreground font-semibold">{t("overview")}</span>
      </div>
    );
  }

  return (
    <nav
      aria-label={t("breadcrumbs")}
      className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium"
    >
      <Link
        href="/dashboard"
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Home className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{t("overview")}</span>
      </Link>

      {segments.slice(1).map((segment, index, array) => {
        const isLast = index === array.length - 1;
        const href = "/" + segments.slice(0, index + 2).join("/");
        const labelKey =
          ROUTE_LABEL_KEYS[segment as keyof typeof ROUTE_LABEL_KEYS];
        const label = labelKey ? t(labelKey) : segment.replace(/-/g, " ");

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight
              className="text-muted-foreground/60 size-3"
              aria-hidden
            />
            {isLast ? (
              <span className="text-foreground font-semibold capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground capitalize transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
