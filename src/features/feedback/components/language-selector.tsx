"use client";

import {
  FEEDBACK_LOCALES,
  localeNames,
  useFeedbackI18n,
} from "@/features/feedback/components/feedback-i18n";

const localeFlags = {
  en: "🇬🇧",
  am: "🇪🇹",
  om: "🇪🇹",
} as const;

export function LanguageSelector() {
  const { locale, setLocale, t } = useFeedbackI18n();

  return (
    <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className="text-base leading-none" aria-hidden="true">
        {localeFlags[locale]}
      </span>
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        {FEEDBACK_LOCALES.map((value) => (
          <option key={value} value={value}>
            {localeNames[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
