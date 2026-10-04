import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useDocumentTitle } from "./use-document-title";

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useDocumentTitle", () => {
  afterEach(() => {
    document.title = "";
  });

  it("sets the title once it is known", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: undefined as string | undefined },
    });
    document.title = "Default";

    rerender({ title: "Smart Watch | Mini Shop" });

    expect(document.title).toBe("Smart Watch | Mini Shop");
  });

  it("re-applies the title if something else overwrites it while mounted", async () => {
    renderHook(() => useDocumentTitle("Smart Watch | Mini Shop"));

    document.title = "Product details | Mini Shop";
    await nextTick();

    expect(document.title).toBe("Smart Watch | Mini Shop");
  });

  it("stops once unmounted", async () => {
    const { unmount } = renderHook(() => useDocumentTitle("Smart Watch | Mini Shop"));
    unmount();

    document.title = "Mini Shop";
    await nextTick();

    expect(document.title).toBe("Mini Shop");
  });
});
