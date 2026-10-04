"use client";

import { useFormatter, useTranslations } from "next-intl";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";

interface QuantityControlProps {
  productName: string;
  quantity: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const stepButtonClasses =
  "flex size-9 items-center justify-center text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600";

export function QuantityControl({ productName, quantity, max, onIncrement, onDecrement }: QuantityControlProps) {
  const t = useTranslations("cart");
  const format = useFormatter();

  return (
    <div role="group" aria-label={t("quantity")} className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label={t("decrease", { name: productName })}
        className={stepButtonClasses}
      >
        <MinusIcon className="size-4" />
      </button>
      <output aria-live="polite" className="w-10 text-center text-sm font-semibold tabular-nums">
        {format.number(quantity)}
      </output>
      <button
        type="button"
        onClick={onIncrement}
        disabled={quantity >= max}
        aria-label={t("increase", { name: productName })}
        className={stepButtonClasses}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
