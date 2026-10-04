"use client";

import { useFormatter, useTranslations } from "next-intl";

import { CartIcon } from "@/components/ui/icons";
import { useCartDetails } from "@/hooks/use-cart-details";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const MAX_BADGE_COUNT = 99;

export function CartLink() {
  const t = useTranslations("header");
  const format = useFormatter();
  const pathname = usePathname();
  const isActive = pathname === "/cart";
  const { purchasableQuantity: count } = useCartDetails().summary;
  const badge = count > MAX_BADGE_COUNT ? `${format.number(MAX_BADGE_COUNT)}+` : format.number(count);

  return (
    <Link
      href="/cart"
      aria-label={t("cartLabel", { count })}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3",
        isActive ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "text-slate-700",
      )}
    >
      <span className="relative">
        <CartIcon />
        {count > 0 && (
          <span
            aria-hidden
            className="absolute -top-2.5 -end-2.5 flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold leading-5 text-white"
          >
            {badge}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">{t("cart")}</span>
    </Link>
  );
}
