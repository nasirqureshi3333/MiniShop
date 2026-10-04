import { afterEach, describe, expect, it } from "vitest";

import { getListingHref, saveListingQuery } from "./listing-location";

describe("listing location", () => {
  afterEach(() => window.sessionStorage.clear());

  it("falls back to the plain listing when nothing was saved", () => {
    expect(getListingHref("en")).toBe("/");
  });

  it("restores the saved filters", () => {
    saveListingQuery("en", "search=head&category=electronics&sort=desc");

    expect(getListingHref("en")).toBe("/?search=head&category=electronics&sort=desc");
  });

  it("drops the language-specific search when the language changed", () => {
    saveListingQuery("en", "search=head&category=electronics");

    expect(getListingHref("ar")).toBe("/?category=electronics");
  });

  it("ignores corrupted storage", () => {
    window.sessionStorage.setItem("mini-shop:listing-query", "{not json");

    expect(getListingHref("en")).toBe("/");
  });
});
