import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageNotFound } from "@/components/layout/page-not-found";
import type { AppLocale } from "@/i18n/routing";
import { STATIC_NOT_FOUND_SEGMENT, isStaticExport } from "@/lib/build-mode";

export function generateStaticParams() {
  return isStaticExport ? [{ rest: [STATIC_NOT_FOUND_SEGMENT] }] : [];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[...rest]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "notFound" });
  return { title: t("title") };
}

export default async function CatchAllPage({ params }: PageProps<"/[locale]/[...rest]">) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);
  if (isStaticExport) return <PageNotFound />;
  notFound();
}
