import type { Category, ProductFilters, SortOrder } from "@/types/api";

export const MAX_TEXT_FILTER_LENGTH = 100;

export const FILTER_PARAMS = {
  search: "search",
  category: "category",
  minPrice: "min_price",
  maxPrice: "max_price",
  sort: "sort",
} as const satisfies Record<keyof ProductFilters, string>;

const SORT_ORDERS: readonly SortOrder[] = ["asc", "desc"];

function parsePrice(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function parseText(value: string | null): string | undefined {
  const trimmed = value?.trim().slice(0, MAX_TEXT_FILTER_LENGTH).trim();
  return trimmed ? trimmed : undefined;
}

export function parseFilters(params: URLSearchParams): ProductFilters {
  const sort = params.get(FILTER_PARAMS.sort);
  const filters: ProductFilters = {
    search: parseText(params.get(FILTER_PARAMS.search)),
    category: parseText(params.get(FILTER_PARAMS.category)),
    minPrice: parsePrice(params.get(FILTER_PARAMS.minPrice)),
    maxPrice: parsePrice(params.get(FILTER_PARAMS.maxPrice)),
    sort: SORT_ORDERS.includes(sort as SortOrder) ? (sort as SortOrder) : undefined,
  };
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
    [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
  }
  return filters;
}

export function serializeFilters(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, param] of Object.entries(FILTER_PARAMS) as [keyof ProductFilters, string][]) {
    const value = filters[key];
    if (value !== undefined && value !== "") params.set(param, String(value));
  }
  return params;
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined);
}

export function resolveCategory(value: string, categories: Category[]): string | null {
  const needle = value.toLocaleLowerCase();
  const match = categories.find(
    (category) => category.slug === needle || category.name.toLocaleLowerCase() === needle,
  );
  return match?.slug ?? null;
}
