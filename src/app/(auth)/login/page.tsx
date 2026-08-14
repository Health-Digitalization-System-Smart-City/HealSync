import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | HealSync",
  description: "Sign in to the HealSync administrative dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
