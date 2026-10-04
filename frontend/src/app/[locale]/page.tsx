import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { Hero } from "@/components/home/hero";
import { ProductCatalog } from "@/components/products/product-catalog";
import { ProductGridSkeleton } from "@/components/products/product-grid";
import type { AppLocale } from "@/i18n/routing";

export default async function ProductsPage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "catalog" });

  const heading = (
    <header>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
    </header>
  );

  return (
    <div className="flex flex-col gap-8">
      <Hero />
      <section id="products" aria-label={t("title")}>
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">{heading}</div>
              <ProductGridSkeleton />
            </div>
          }
        >
          <ProductCatalog heading={heading} />
        </Suspense>
      </section>
    </div>
  );
}
