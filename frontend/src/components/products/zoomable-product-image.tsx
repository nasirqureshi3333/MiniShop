"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { type PointerEvent, useEffect, useRef, useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

import { ProductImage } from "./product-image";

const HI_RES_SIZES = "1600px";

interface ZoomableProductImageProps {
  src: string;
  alt: string;
  sizes: string;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function ZoomableProductImage({ src, alt, sizes }: ZoomableProductImageProps) {
  const t = useTranslations("product");
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [isZoomed, setIsZoomed] = useState(false);
  const [hiResRequestedSrc, setHiResRequestedSrc] = useState<string | null>(null);
  const [hiResLoadedSrc, setHiResLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasFailed = failedSrc === src;
  const isHiResRequested = hiResRequestedSrc === src;
  const isHiResLoaded = hiResLoadedSrc === src;

  const cancelFrame = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  useEffect(() => cancelFrame, []);

  const applyZoomOrigin = () => {
    frameRef.current = null;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clampPercent(((pointerRef.current.x - rect.left) / rect.width) * 100);
    const y = clampPercent(((pointerRef.current.y - rect.top) / rect.height) * 100);
    container.style.setProperty("--zoom-origin", `${x}% ${y}%`);
  };

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(applyZoomOrigin);
  };

  const canZoom = (event: PointerEvent<HTMLDivElement>) => event.pointerType === "mouse" && !hasFailed;

  return (
    <div
      ref={containerRef}
      className={cn("relative size-full overflow-hidden", !hasFailed && "[@media(hover:hover)_and_(pointer:fine)]:cursor-crosshair")}
      onPointerEnter={(event) => {
        if (!canZoom(event)) return;
        pointerRef.current = { x: event.clientX, y: event.clientY };
        cancelFrame();
        applyZoomOrigin();
        setIsZoomed(true);
        setHiResRequestedSrc(src);
      }}
      onPointerMove={(event) => {
        if (canZoom(event)) trackPointer(event);
      }}
      onPointerLeave={() => {
        cancelFrame();
        setIsZoomed(false);
      }}
    >
      <div
        className={cn(
          "relative size-full origin-[var(--zoom-origin,50%_50%)] transition-[scale] duration-300 ease-out motion-reduce:transition-none",
          isZoomed && !hasFailed ? "scale-[2.5]" : "scale-100",
        )}
      >
        <ProductImage src={src} alt={alt} sizes={sizes} preload onError={() => setFailedSrc(src)} />
        {isHiResRequested && !hasFailed && (
          <Image
            key={src}
            src={src}
            alt=""
            aria-hidden
            fill
            sizes={HI_RES_SIZES}
            className={cn("object-cover transition-opacity duration-300", isHiResLoaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setHiResLoadedSrc(src)}
          />
        )}
      </div>

      {!hasFailed && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-3 end-3 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-opacity [@media(hover:hover)_and_(pointer:fine)]:flex",
            isZoomed && "opacity-0",
          )}
        >
          <SearchIcon className="size-3.5" />
          {t("hoverToZoom")}
        </span>
      )}
    </div>
  );
}
