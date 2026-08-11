import {
  Building2,
  Database,
  HeartPulse,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const stack = [
  { name: "Next.js 16", role: "App Router · React Server Components" },
  { name: "TypeScript", role: "Strict mode" },
  { name: "Tailwind CSS v4", role: "CSS-first configuration" },
  { name: "Prisma 7", role: "PostgreSQL" },
  { name: "Better Auth", role: "Administrator authentication" },
  { name: "Vitest + Playwright", role: "Unit & e2e testing" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
      <div className="flex flex-col items-start gap-8">
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <Sparkles className="size-3.5" aria-hidden />
          HealSync Smart City Digitalization
        </Badge>

        <div className="flex flex-col items-start gap-4">
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            <HeartPulse
              className="size-10 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            HealSync
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-8">
            A feedback platform for private healthcare clinics. Patients share
            their experience; administrators analyze satisfaction, services, and
            staff performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/feedback"
            className={
              buttonVariants({ variant: "default", size: "lg" }) +
              " gap-2 font-semibold shadow-md"
            }
          >
            <MessageSquareHeart className="size-5" />
            Open Patient Feedback Page
          </Link>
          <Link
            href="/api/auth/get-session"
            className={buttonVariants({ variant: "outline" })}
          >
            Auth health check
          </Link>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          {stack.map((item) => (
            <div
              key={item.name}
              className="border-border bg-card flex items-start gap-3 rounded-lg border p-4"
            >
              <div className="bg-primary/10 mt-0.5 rounded-md p-1.5">
                <Database className="text-primary size-4" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-muted-foreground text-xs">{item.role}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
          Patient feedback submission is active and operational.
        </p>
      </div>
    </main>
  );
}
