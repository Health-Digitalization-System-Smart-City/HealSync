import type { Metadata } from "next";

import { getBranches } from "@/features/branches/actions";
import { PatientFeedbackForm } from "@/features/feedback/components/feedback-form";

export const metadata: Metadata = {
  title: "Patient Feedback | Smart Feedback",
  description:
    "Share your healthcare experience with Smart Feedback. Submit branch & service feedback to help us improve patient care.",
};

export default async function FeedbackPage() {
  const branchesResult = await getBranches();
  const initialBranches = branchesResult.success ? branchesResult.data : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] py-4 sm:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl"
      />

      <a
        href="#feedback-form"
        className="sr-only z-50 mx-auto block w-max rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white focus:not-sr-only"
      >
        Skip to feedback form
      </a>

      <div id="feedback-form" className="relative">
        <PatientFeedbackForm initialBranches={initialBranches} />
      </div>
    </main>
  );
}
