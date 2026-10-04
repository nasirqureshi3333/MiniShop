import type { Language, ProductFilters } from "@/types/api";

export const queryKeys = {
  products: (lang: Language, filters: ProductFilters) => ["products", lang, filters] as const,
  product: (id: number, lang: Language) => ["product", id, lang] as const,
  categories: (lang: Language) => ["categories", lang] as const,
};
