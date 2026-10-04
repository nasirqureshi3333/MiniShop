import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useFormatPrice } from "./use-format-price";

function wrapperFor(locale: "en" | "ar") {
  return function IntlWrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={{}} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    );
  };
}

describe("useFormatPrice", () => {
  it("formats USD for English", () => {
    const { result } = renderHook(() => useFormatPrice(), { wrapper: wrapperFor("en") });

    expect(result.current(1299)).toBe("$1,299.00");
  });

  it("isolates the currency symbol in Arabic so bidi reordering cannot garble it", () => {
    const { result } = renderHook(() => useFormatPrice(), { wrapper: wrapperFor("ar") });
    const formatted = result.current(79.99);

    expect(formatted).toMatch(/⁨US\$⁩/);
    expect(formatted).toContain("79.99");
  });
});
