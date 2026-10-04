import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CartView } from "@/components/cart/cart-view";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const locale = (await params).locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title") };
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const locale = (await params).locale as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cart" });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
      <CartView />
    </div>
  );
}
