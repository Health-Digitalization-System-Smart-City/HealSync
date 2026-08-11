import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | HealSync",
  description: "Request a password reset for your HealSync account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
