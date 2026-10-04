"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import { Link } from "@/i18n/navigation";
import { getListingHref } from "@/lib/listing-location";

const noopSubscribe = () => () => {};

interface BackToProductsLinkProps {
  className?: string;
  children: ReactNode;
}

export function BackToProductsLink({ className, children }: BackToProductsLinkProps) {
  const locale = useLocale();
  const href = useSyncExternalStore(
    noopSubscribe,
    () => getListingHref(locale),
    () => "/",
  );

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
