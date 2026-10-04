import type { Category, Language, ListResponse, Product, ProductFilters } from "@/types/api";

import { apiGet } from "./client";

export function fetchProducts(
  lang: Language,
  filters: ProductFilters,
  signal?: AbortSignal,
): Promise<ListResponse<Product>> {
  return apiGet("/products", {
    params: {
      lang,
      search: filters.search,
      category: filters.category,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      sort: filters.sort,
    },
    signal,
  });
}

export function fetchProduct(id: number, lang: Language, signal?: AbortSignal): Promise<Product> {
  return apiGet(`/products/${id}`, { params: { lang }, signal });
}

export function fetchCategories(lang: Language, signal?: AbortSignal): Promise<ListResponse<Category>> {
  return apiGet("/categories", { params: { lang }, signal });
}
