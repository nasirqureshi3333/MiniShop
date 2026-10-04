"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { fetchCategories, fetchProduct, fetchProducts } from "@/lib/api/products";
import { queryKeys } from "@/lib/api/query-keys";
import type { Language, ProductFilters } from "@/types/api";

const productQuery = (id: number, lang: Language) => ({
  queryKey: queryKeys.product(id, lang),
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchProduct(id, lang, signal),
});

export function useProducts(filters: ProductFilters, { enabled = true }: { enabled?: boolean } = {}) {
  const lang = useLocale();
  return useQuery({
    queryKey: queryKeys.products(lang, filters),
    queryFn: ({ signal }) => fetchProducts(lang, filters, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  const lang = useLocale();
  return useQuery(productQuery(id, lang));
}

export function useProductsByIds(ids: number[]) {
  const lang = useLocale();
  return useQueries({ queries: ids.map((id) => productQuery(id, lang)) });
}

export function useCategories() {
  const lang = useLocale();
  return useQuery({
    queryKey: queryKeys.categories(lang),
    queryFn: ({ signal }) => fetchCategories(lang, signal),
    staleTime: 5 * 60 * 1000,
  });
}
