"use client";

import type { ReactNode } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { PRODUCT_PATH } from "@/lib/product-route";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" || pathname === PRODUCT_PATH : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-w-11 items-center justify-center px-1 py-5 text-sm font-medium transition-colors hover:text-brand-700",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
        isActive ? "text-brand-700 after:bg-brand-600" : "text-slate-600 after:bg-transparent",
      )}
    >
      {children}
    </Link>
  );
}
