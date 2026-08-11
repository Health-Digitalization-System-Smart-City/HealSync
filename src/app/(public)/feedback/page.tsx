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
    <main className="bg-background min-h-screen py-8 sm:py-12">
      <PatientFeedbackForm initialBranches={initialBranches} />
    </main>
  );
}
