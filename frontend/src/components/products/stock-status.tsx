import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

export const LOW_STOCK_THRESHOLD = 5;

type Level = "out" | "low" | "in";

const getLevel = (stock: number): Level => (stock <= 0 ? "out" : stock <= LOW_STOCK_THRESHOLD ? "low" : "in");

const SOFT_TONES: Record<Level, string> = {
  out: "bg-red-50 text-red-700 ring-red-200",
  low: "bg-amber-50 text-amber-800 ring-amber-200",
  in: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const SOLID_TONES: Record<Level, string> = {
  out: "bg-red-600 text-white",
  low: "bg-amber-400 text-amber-950",
  in: "bg-emerald-600 text-white",
};

interface StockStatusProps {
  stock: number;
  variant?: "soft" | "solid";
  className?: string;
}

export function StockStatus({ stock, variant = "soft", className }: StockStatusProps) {
  const t = useTranslations("product");
  const level = getLevel(stock);

  const label =
    level === "out"
      ? t("outOfStock")
      : level === "low"
        ? t("lowStock", { count: stock })
        : variant === "solid"
          ? t("inStockShort")
          : t("inStock", { count: stock });

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "soft" ? `ring-1 ring-inset ${SOFT_TONES[level]}` : `shadow-sm ${SOLID_TONES[level]}`,
        className,
      )}
    >
      {label}
    </span>
  );
}
