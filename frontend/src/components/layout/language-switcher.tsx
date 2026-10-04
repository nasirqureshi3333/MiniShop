"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { GlobeIcon } from "@/components/ui/icons";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { FILTER_PARAMS } from "@/lib/catalog-filters";
import { cn } from "@/lib/cn";

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    const params = new URLSearchParams(window.location.search);
    params.delete(FILTER_PARAMS.search);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { locale: nextLocale, scroll: false });
    });
  };

  return (
    <div
      role="group"
      aria-label={t("header.languageLabel")}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm",
        isPending && "opacity-60",
      )}
    >
      <GlobeIcon className="ms-1.5 hidden size-4 text-slate-500 sm:block" />
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={code === locale}
          aria-label={t(`languages.${code}`)}
          disabled={isPending}
          onClick={() => switchTo(code)}
          className={cn(
            "flex min-h-11 min-w-11 items-center justify-center rounded-full px-2.5 py-1 text-sm font-medium transition-colors sm:min-h-0 sm:min-w-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
            code === locale ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100",
          )}
        >
          <span aria-hidden className="sm:hidden">
            {t(`languagesShort.${code}`)}
          </span>
          <span aria-hidden className="hidden sm:inline">
            {t(`languages.${code}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
