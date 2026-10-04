import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { QueryProvider } from "@/components/providers/query-provider";
import { getDirection, routing } from "@/i18n/routing";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic", "latin"], variable: "--font-noto-arabic", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: { default: t("title"), template: `%s | ${t("title")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${inter.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans" suppressHydrationWarning>
        <NextIntlClientProvider>
          <QueryProvider>
            <SiteHeader />
            <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
