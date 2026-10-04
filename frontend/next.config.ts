import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default function nextConfig(phase: string): NextConfig {
  const isStaticExport = phase === PHASE_PRODUCTION_BUILD;

  return withNextIntl({
    ...(isStaticExport && {
      output: "export",
      env: { STATIC_EXPORT: "true" },
    }),
    images: isStaticExport
      ? { loader: "custom", loaderFile: "./src/lib/unsplash-image-loader.ts" }
      : { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }] },
  });
}
