import { defineRouting } from "next-intl/routing";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localeCookie: { maxAge: ONE_YEAR_IN_SECONDS },
});

export type AppLocale = (typeof routing.locales)[number];

const RTL_LOCALES: ReadonlySet<AppLocale> = new Set(["ar"]);

export function getDirection(locale: AppLocale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
