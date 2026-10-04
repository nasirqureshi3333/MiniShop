"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ImageIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface ProductImageProps {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  onError?: () => void;
}

export function ProductImage({ src, alt, sizes, preload = false, className, onError }: ProductImageProps) {
  const t = useTranslations("product");
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className="flex size-full flex-col items-center justify-center gap-2 text-slate-400">
        <ImageIcon className="size-10" />
        <span className="text-xs">{t("imageUnavailable")}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={cn("object-cover", className)}
      onError={() => {
        setFailedSrc(src);
        onError?.();
      }}
    />
  );
}
