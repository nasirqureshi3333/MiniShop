import { FILTER_PARAMS } from "./catalog-filters";

const STORAGE_KEY = "mini-shop:listing-query";

interface StoredListing {
  locale: string;
  query: string;
}

export function saveListingQuery(locale: string, query: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, query } satisfies StoredListing));
  } catch {
  }
}

export function getListingHref(locale: string): string {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as StoredListing | null;
    if (!stored || typeof stored.query !== "string") return "/";
    const params = new URLSearchParams(stored.query);
    if (stored.locale !== locale) params.delete(FILTER_PARAMS.search);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  } catch {
    return "/";
  }
}
