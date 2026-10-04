import type { ImageLoaderProps } from "next/image";

export default function unsplashImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  if (url.hostname !== "images.unsplash.com") return src;

  const sourceWidth = Number(url.searchParams.get("w"));
  const sourceHeight = Number(url.searchParams.get("h"));
  if (sourceWidth > 0 && sourceHeight > 0) {
    url.searchParams.set("h", String(Math.round((sourceHeight * width) / sourceWidth)));
  }
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  return url.toString();
}
