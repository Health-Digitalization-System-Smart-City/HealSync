import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Smart Feedback",
  description: "Sign in to the Smart Feedback administrative dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
