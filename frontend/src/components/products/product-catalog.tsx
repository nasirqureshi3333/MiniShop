"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import { useCategories, useProducts } from "@/hooks/use-catalog-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessageKey } from "@/lib/api/error-messages";
import { hasActiveFilters, resolveCategory, serializeFilters } from "@/lib/catalog-filters";
import { saveListingQuery } from "@/lib/listing-location";

import { ProductFilters } from "./product-filters";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";

const SEARCH_DEBOUNCE_MS = 300;

export function ProductCatalog({ heading }: { heading: ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const { filters, updateFilters, clearFilters } = useCatalogFilters();
  const categories = useCategories();

  const resolvedCategory =
    filters.category && categories.data ? resolveCategory(filters.category, categories.data.items) : filters.category;
  const isCategoryResolved = resolvedCategory === filters.category || categories.isError;
  useEffect(() => {
    if (!isCategoryResolved) updateFilters({ category: resolvedCategory ?? undefined });
  }, [isCategoryResolved, resolvedCategory, updateFilters]);

  const products = useProducts(filters, {
    enabled: !filters.category || (categories.isFetched && isCategoryResolved),
  });
  const { data, isPending, isError, error, isPlaceholderData, isFetching, refetch } = products;

  const listingQuery = serializeFilters(filters).toString();
  useEffect(() => saveListingQuery(locale, listingQuery), [locale, listingQuery]);

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const lastSyncedSearch = useRef(filters.search ?? "");

  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next === lastSyncedSearch.current) return;
    lastSyncedSearch.current = next;
    updateFilters({ search: next || undefined });
  }, [debouncedSearch, updateFilters]);

  const urlSearch = filters.search ?? "";
  useEffect(() => {
    if (urlSearch === lastSyncedSearch.current) return;
    lastSyncedSearch.current = urlSearch;
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const handleClear = () => {
    lastSyncedSearch.current = "";
    setSearchInput("");
    clearFilters();
  };

  const canClear = hasActiveFilters(filters) || searchInput !== "";
  const clearButton = (
    <Button variant="secondary" size="sm" onClick={handleClear}>
      {t("filters.clear")}
    </Button>
  );

  const renderResults = () => {
    if (isPending) {
      return (
        <div role="status" aria-busy>
          <span className="sr-only">{t("states.loading")}</span>
          <ProductGridSkeleton />
        </div>
      );
    }
    if (isError && !data) {
      const messageKey = getErrorMessageKey(error);
      return (
        <StateMessage
          tone="error"
          title={t("states.errorTitle")}
          description={t(`states.${messageKey}`)}
          action={
            messageKey === "invalidRequest" ? (
              clearButton
            ) : (
              <Button onClick={() => refetch()}>{t("states.retry")}</Button>
            )
          }
        />
      );
    }
    if (data.items.length === 0) {
      return (
        <StateMessage
          title={t("states.emptyTitle")}
          description={t("states.emptyDescription")}
          action={canClear && clearButton}
        />
      );
    }
    return (
      <div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
        <ProductGrid products={data.items} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <ProductFilters
        heading={heading}
        filters={filters}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onChange={updateFilters}
      />

      <section aria-labelledby="results-heading" aria-busy={isFetching} className="flex flex-col gap-4">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-slate-600">
          <h2 id="results-heading" aria-live="polite" className="flex items-center gap-3 font-medium text-slate-700">
            {data ? t("catalog.resultsCount", { count: data.total }) : <span className="sr-only">{t("catalog.title")}</span>}
            {isFetching && isPlaceholderData && <span className="text-slate-500">{t("catalog.updating")}</span>}
          </h2>
          {canClear && data && data.items.length > 0 && clearButton}
        </div>
        {renderResults()}
      </section>
    </div>
  );
}
