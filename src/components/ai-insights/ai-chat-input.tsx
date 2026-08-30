"use client";

import { useRef, useEffect } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AiChatInput({
  question,
  onQuestionChange,
  onSubmit,
  isPending,
  canSubmit,
  ready,
}: {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  canSubmit: boolean;
  ready: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [question]);

  // Auto-focus on mount
  useEffect(() => {
    if (ready && !isPending) {
      textareaRef.current?.focus();
    }
  }, [ready, isPending]);

  return (
    <div className="border-t border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-3"
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder={
              ready
                ? "Ask anything about your clinic's feedback…"
                : "Loading period data…"
            }
            disabled={isPending || !ready}
            aria-label="Ask AI a question"
            className={cn(
              "min-h-[48px] resize-none rounded-xl border-slate-200 bg-white pr-12 text-sm leading-relaxed placeholder:text-slate-400 focus:border-indigo-300 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-500/40",
              isPending && "opacity-60",
            )}
          />
          <div className="absolute right-2 bottom-2">
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className={cn(
                "h-8 w-8 rounded-lg p-0 transition-all",
                canSubmit
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500",
              )}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <Sparkles
                  className="size-3 animate-pulse text-indigo-500"
                  aria-hidden
                />
                Analyzing with real data…
              </span>
            ) : question.trim().length > 0 ? (
              <span>{question.trim().length} characters</span>
            ) : (
              "Answers backed by real feedback analytics"
            )}
          </p>
          <p className="text-[10px] text-slate-300 dark:text-slate-600">
            Shift+Enter for new line
          </p>
        </div>
      </form>
    </div>
  );
}
