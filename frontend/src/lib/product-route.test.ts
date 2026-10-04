import { describe, expect, it } from "vitest";

import { parseProductId, productHref } from "./product-route";

describe("product route", () => {
  it("builds the details URL", () => {
    expect(productHref(3)).toBe("/product?id=3");
  });

  it.each([
    ["3", 3],
    ["15", 15],
    [null, null],
    ["", null],
    ["0", null],
    ["-1", null],
    ["1.5", null],
    ["012", null],
    ["abc", null],
    ["99999999999999999999", null],
  ])("parses %j as %j", (value, expected) => {
    expect(parseProductId(value)).toBe(expected);
  });
});
