import { useTranslations } from "next-intl";

import { BagIcon, GridIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

import { CartLink } from "./cart-link";
import { LanguageSwitcher } from "./language-switcher";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <BagIcon className="size-5" />
          </span>
          <span className="max-[359px]:sr-only">{t("storeName")}</span>
        </Link>

        <nav aria-label={t("products")} className="ms-auto flex sm:ms-0 sm:flex-1">
          <NavLink href="/">
            <GridIcon className="size-5 sm:hidden" />
            <span className="max-sm:sr-only">{t("products")}</span>
          </NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <CartLink />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
