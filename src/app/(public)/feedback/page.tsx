import { Metadata } from "next";

import { getBranches } from "@/features/branches/actions";
import { PatientFeedbackForm } from "@/features/feedback/components/feedback-form";

export const metadata: Metadata = {
  title: "Patient Feedback | HealSync Healthcare",
  description:
    "Share your healthcare experience with HealSync. Submit branch & service feedback to help us improve patient care.",
};

export default async function FeedbackPage() {
  const branchesResult = await getBranches();
  const initialBranches = branchesResult.success ? branchesResult.data : [];

  return (
    <main className="bg-background min-h-screen py-4 sm:py-8">
      <a
        href="#feedback-form"
        className="bg-primary text-primary-foreground sr-only z-50 mx-auto block w-max rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only"
      >
        Skip to feedback form
      </a>
      <div id="feedback-form">
        <PatientFeedbackForm initialBranches={initialBranches} />
      </div>
    </main>
  );
}
