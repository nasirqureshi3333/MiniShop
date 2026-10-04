"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";

import { fieldClasses, labelClasses } from "@/components/ui/field-styles";
import { SearchIcon } from "@/components/ui/icons";
import { useCategories } from "@/hooks/use-catalog-queries";
import { MAX_TEXT_FILTER_LENGTH } from "@/lib/catalog-filters";
import type { ProductFilters as Filters, SortOrder } from "@/types/api";

import { PriceRangeForm } from "./price-range-form";

interface ProductFiltersProps {
  heading?: ReactNode;
  filters: Filters;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<Filters>) => void;
}

export function ProductFilters({ heading, filters, searchValue, onSearchChange, onChange }: ProductFiltersProps) {
  const t = useTranslations();
  const id = useId();
  const categories = useCategories();
  const isCategoryPending = categories.isPending && filters.category !== undefined;

  return (
    <section
      aria-label={t("filters.label")}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
    >
      {heading}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-[2fr_1fr_1fr_2fr] xl:items-end">
        <div className="col-span-2 xl:col-span-1">
          <label htmlFor={`${id}-search`} className={labelClasses}>
            {t("filters.search")}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id={`${id}-search`}
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              maxLength={MAX_TEXT_FILTER_LENGTH}
              autoComplete="off"
              className={`${fieldClasses} ps-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-category`} className={labelClasses}>
            {t("filters.category")}
          </label>
          <select
            id={`${id}-category`}
            value={filters.category ?? ""}
            onChange={(event) => onChange({ category: event.target.value || undefined })}
            disabled={categories.isPending}
            className={fieldClasses}
          >
            <option value="">{t("filters.allCategories")}</option>
            {isCategoryPending && <option value={filters.category}>{t("states.loading")}</option>}
            {categories.data?.items.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-sort`} className={labelClasses}>
            {t("filters.sort")}
          </label>
          <select
            id={`${id}-sort`}
            value={filters.sort ?? ""}
            onChange={(event) => onChange({ sort: (event.target.value || undefined) as SortOrder | undefined })}
            className={fieldClasses}
          >
            <option value="">{t("filters.sortDefault")}</option>
            <option value="asc">{t("filters.sortAsc")}</option>
            <option value="desc">{t("filters.sortDesc")}</option>
          </select>
        </div>

        <div className="col-span-2 xl:col-span-1">
          <PriceRangeForm
            key={`${filters.minPrice ?? ""}:${filters.maxPrice ?? ""}`}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onApply={onChange}
          />
        </div>
      </div>
    </section>
  );
}
