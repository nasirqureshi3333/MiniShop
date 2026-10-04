import { describe, expect, it, vi } from "vitest";

import { ApiError } from "./api-error";
import { apiGet, buildUrl } from "./client";
import { fetchProducts } from "./products";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("buildUrl", () => {
  it("uses the configured base URL and omits empty parameters", () => {
    expect(buildUrl("/products", { lang: "ar", search: "سماعات", category: "", min_price: undefined, sort: null })).toBe(
      "http://api.test/api/products?lang=ar&search=%D8%B3%D9%85%D8%A7%D8%B9%D8%A7%D8%AA",
    );
  });
});

describe("apiGet", () => {
  it("returns parsed JSON on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "healthy" }));

    await expect(apiGet("/health")).resolves.toEqual({ status: "healthy" });
  });

  it("maps the API error envelope to ApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: { code: "not_found", message: "Product with id 9 was not found.", details: [] } }, 404),
    );

    const error = await apiGet("/products/9").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: "not_found", isNotFound: true, isClientError: true });
  });

  it("handles non-JSON error bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Bad gateway", { status: 502, statusText: "Bad Gateway" }));

    await expect(apiGet("/products")).rejects.toMatchObject({ status: 502, code: "http_error", isClientError: false });
  });

  it("converts network failures to ApiError with status 0", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiGet("/products")).rejects.toMatchObject({ status: 0, code: "network_error" });
  });

  it("rethrows caller cancellations untouched", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("Aborted", "AbortError");
    vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      controller.abort();
      return Promise.reject(abortError);
    });

    await expect(apiGet("/products", { signal: controller.signal })).rejects.toBe(abortError);
  });
});

describe("fetchProducts", () => {
  it("sends language and filters using the API parameter names", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ total: 0, items: [] }));

    await fetchProducts("en", { search: "head", category: "electronics", minPrice: 20, maxPrice: 100, sort: "asc" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/api/products?lang=en&search=head&category=electronics&min_price=20&max_price=100&sort=asc",
    );
  });
});
