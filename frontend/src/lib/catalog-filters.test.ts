import { describe, expect, it } from "vitest";

import { MAX_TEXT_FILTER_LENGTH, hasActiveFilters, parseFilters, resolveCategory, serializeFilters } from "./catalog-filters";

const parse = (query: string) => parseFilters(new URLSearchParams(query));

describe("parseFilters", () => {
  it("reads all supported filters", () => {
    expect(parse("search=head&category=electronics&min_price=20&max_price=100&sort=desc")).toEqual({
      search: "head",
      category: "electronics",
      minPrice: 20,
      maxPrice: 100,
      sort: "desc",
    });
  });

  it("ignores values the API would reject", () => {
    expect(parse("search=%20%20&sort=up&min_price=-1&max_price=abc")).toEqual({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
    });
  });

  it("swaps an inverted price range instead of silently dropping it", () => {
    const filters = parse("min_price=200&max_price=50");
    expect(filters.minPrice).toBe(50);
    expect(filters.maxPrice).toBe(200);
  });

  it("truncates text filters to the length the API accepts", () => {
    const filters = parse(`search=${"a".repeat(250)}`);
    expect(filters.search).toHaveLength(MAX_TEXT_FILTER_LENGTH);
  });
});

describe("serializeFilters", () => {
  it("writes only defined values using API parameter names", () => {
    expect(serializeFilters({ search: "head", minPrice: 0, sort: "asc" }).toString()).toBe(
      "search=head&min_price=0&sort=asc",
    );
  });

  it("round-trips through parseFilters", () => {
    const filters = { search: "سماعات", category: "electronics", minPrice: 5, maxPrice: 50, sort: "asc" as const };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});

describe("hasActiveFilters", () => {
  it("detects whether any filter is set", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ search: undefined })).toBe(false);
    expect(hasActiveFilters({ minPrice: 0 })).toBe(true);
  });
});

describe("resolveCategory", () => {
  const categories = [
    { slug: "electronics", name: "Electronics" },
    { slug: "home", name: "المنزل" },
  ];

  it("matches slugs and localized names case-insensitively", () => {
    expect(resolveCategory("electronics", categories)).toBe("electronics");
    expect(resolveCategory("ELECTRONICS", categories)).toBe("electronics");
    expect(resolveCategory("المنزل", categories)).toBe("home");
  });

  it("returns null for unknown categories", () => {
    expect(resolveCategory("toys", categories)).toBeNull();
  });
});
