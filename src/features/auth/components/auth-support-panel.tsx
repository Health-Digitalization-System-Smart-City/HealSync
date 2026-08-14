import { ShieldCheck } from "lucide-react";

interface AuthSupportPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  items?: string[];
}

/** Supporting context for authentication screens; details stay desktop-only. */
export function AuthSupportPanel({
  eyebrow,
  title,
  description,
  items = [],
}: AuthSupportPanelProps) {
  return (
    <aside className="border-primary/10 bg-primary/5 rounded-[1.5rem] border p-6 sm:rounded-[2rem] sm:p-8">
      <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-foreground mt-3 text-3xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="text-muted-foreground mt-3 max-w-md text-base leading-7">
        {description}
      </p>
      {items.length > 0 ? (
        <div className="mt-8 hidden space-y-3 lg:block">
          {items.map((item) => (
            <div
              key={item}
              className="surface-card text-foreground flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
            >
              <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
