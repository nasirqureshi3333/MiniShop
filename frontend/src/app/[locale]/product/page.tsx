import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { ProductDetailsLoading } from "@/components/products/product-details";
import { ProductPage } from "@/components/products/product-page";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: PageProps<"/[locale]/product">): Promise<Metadata> {
  const locale = (await params).locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "product" });
  return { title: t("detailsTitle") };
}

export default async function ProductDetailsRoute({ params }: PageProps<"/[locale]/product">) {
  setRequestLocale((await params).locale as AppLocale);
  return (
    <Suspense fallback={<ProductDetailsLoading />}>
      <ProductPage />
    </Suspense>
  );
}
