import { describe, expect, it } from "vitest";

import unsplashImageLoader from "./unsplash-image-loader";

const params = (url: string) => new URL(url).searchParams;

describe("unsplashImageLoader", () => {
  it("requests the width and quality next/image asks for", () => {
    const url = unsplashImageLoader({ src: "https://images.unsplash.com/photo-1?w=1600&q=80&fit=crop", width: 640, quality: 75 });

    expect(params(url).get("w")).toBe("640");
    expect(params(url).get("q")).toBe("75");
    expect(params(url).get("fit")).toBe("crop");
  });

  it("keeps the aspect ratio of fixed crops", () => {
    const url = unsplashImageLoader({
      src: "https://images.unsplash.com/photo-1?w=1600&h=1200&fit=crop&crop=focalpoint&fp-z=1.4",
      width: 400,
    });

    expect(params(url).get("w")).toBe("400");
    expect(params(url).get("h")).toBe("300");
    expect(params(url).get("fp-z")).toBe("1.4");
  });

  it("leaves other hosts untouched", () => {
    const src = "https://example.com/image.jpg";
    expect(unsplashImageLoader({ src, width: 640 })).toBe(src);
  });
});
