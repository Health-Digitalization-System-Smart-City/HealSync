import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | HealSync",
  description: "Administrative dashboard for HealSync healthcare clinics.",
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-muted-foreground text-sm">
        Dashboard is under construction.
      </p>
    </main>
  );
}
