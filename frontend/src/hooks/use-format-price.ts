"use client";

import { useLocale } from "next-intl";
import { useCallback, useMemo } from "react";

import { getDirection } from "@/i18n/routing";
import { config } from "@/lib/config";

const FSI = "⁨";
const PDI = "⁩";

export function useFormatPrice() {
  const locale = useLocale();
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: config.currency }),
    [locale],
  );
  const isolateCurrency = getDirection(locale) === "rtl";

  return useCallback(
    (amount: number) =>
      isolateCurrency
        ? formatter
            .formatToParts(amount)
            .map((part) => (part.type === "currency" ? `${FSI}${part.value}${PDI}` : part.value))
            .join("")
        : formatter.format(amount),
    [formatter, isolateCurrency],
  );
}
