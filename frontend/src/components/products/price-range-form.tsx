"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { fieldClasses } from "@/components/ui/field-styles";
import { AlertIcon } from "@/components/ui/icons";

interface PriceRangeFormProps {
  minPrice?: number;
  maxPrice?: number;
  onApply: (range: { minPrice?: number; maxPrice?: number }) => void;
}

type Field = "min" | "max";

interface ValidationError {
  message: "invalidPrice" | "invalidRange";
  fields: Field[];
}

function toPrice(value: string): number | undefined | null {
  if (value.trim() === "") return undefined;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function PriceRangeForm({ minPrice, maxPrice, onApply }: PriceRangeFormProps) {
  const t = useTranslations("filters");
  const id = useId();
  const [min, setMin] = useState(minPrice?.toString() ?? "");
  const [max, setMax] = useState(maxPrice?.toString() ?? "");
  const [error, setError] = useState<ValidationError | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextMin = toPrice(min);
    const nextMax = toPrice(max);
    if (nextMin === null || nextMax === null) {
      const fields: Field[] = [];
      if (nextMin === null) fields.push("min");
      if (nextMax === null) fields.push("max");
      return setError({ message: "invalidPrice", fields });
    }
    if (nextMin !== undefined && nextMax !== undefined && nextMin > nextMax) {
      return setError({ message: "invalidRange", fields: ["min"] });
    }
    setError(null);
    onApply({ minPrice: nextMin, maxPrice: nextMax });
  };

  const errorId = `${id}-error`;
  const inputProps = (field: Field) => {
    const isInvalid = error?.fields.includes(field) ?? false;
    return {
      type: "number",
      inputMode: "decimal",
      min: 0,
      step: "0.01",
      "aria-invalid": isInvalid,
      "aria-describedby": isInvalid ? errorId : undefined,
      className: fieldClasses,
    } as const;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1.5">
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium text-slate-700">{t("priceRange")}</legend>
        <div className="flex items-center gap-2">
          <input
            {...inputProps("min")}
            value={min}
            onChange={(event) => {
              setMin(event.target.value);
              setError(null);
            }}
            placeholder={t("minPlaceholder")}
            aria-label={t("minPrice")}
          />
          <span aria-hidden className="text-slate-400">
            –
          </span>
          <input
            {...inputProps("max")}
            value={max}
            onChange={(event) => {
              setMax(event.target.value);
              setError(null);
            }}
            placeholder={t("maxPlaceholder")}
            aria-label={t("maxPrice")}
          />
          <Button type="submit" size="sm" className="h-10 shrink-0 px-4">
            {t("apply")}
          </Button>
        </div>
      </fieldset>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-700"
        >
          <AlertIcon className="size-4 shrink-0" />
          {t(error.message)}
        </p>
      )}
    </form>
  );
}
