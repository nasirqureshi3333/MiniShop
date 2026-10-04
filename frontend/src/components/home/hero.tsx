import { Aref_Ruqaa, Caveat } from "next/font/google";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { ForwardArrowIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const caveat = Caveat({ subsets: ["latin"], weight: "600", variable: "--font-hand-latin", preload: false });
const arefRuqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: "700", variable: "--font-hand-arabic", preload: false });

const SCENE_IMAGE =
  "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=1400&h=1050&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.6&fp-z=1.15&q=80";
const SCENE_TILE_IMAGE =
  "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.62&fp-z=1.3&q=80";
const ACCENT_IMAGE =
  "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&fp-z=1.15&q=80";

function NoteArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M4 8c26 0 50 10 62 40" />
      <path d="M56 42l10 7 3-12" />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        caveat.variable,
        arefRuqaa.variable,
        "relative isolate overflow-hidden rounded-3xl",
        "bg-gradient-to-r from-brand-50 via-[#eef0ff] to-[#d4dafe] rtl:bg-gradient-to-l",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 end-0 hidden w-1/2 bg-[#d4dafe] md:block",
          "[mask-image:linear-gradient(to_right,transparent,black_20%)]",
          "rtl:[mask-image:linear-gradient(to_left,transparent,black_20%)]",
        )}
      >
        <Image
          src={SCENE_IMAGE}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1280px) 700px, 55vw"
          className="object-contain object-[70%_center] p-6 rtl:object-[30%_center]"
        />
      </div>

      <div className="relative grid min-h-[22rem] items-center px-5 py-8 sm:px-10 sm:py-12 md:grid-cols-2 lg:px-14">
        <div className="relative flex flex-col items-start gap-4 md:pe-8">
          <div
            aria-hidden
            className="absolute -top-2 end-0 size-24 overflow-hidden rounded-2xl bg-[#d4dafe] shadow-lg ring-1 ring-white/70 md:hidden"
          >
            <Image src={SCENE_TILE_IMAGE} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <p className="pe-28 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 md:pe-0 rtl:tracking-normal">
            {t("eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="pe-28 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:pe-0 lg:text-5xl"
          >
            {t("titleStart")} <span className="text-brand-600">{t("titleHighlight")}</span>
          </h1>
          <p className="max-w-md text-sm text-slate-600 sm:text-base">{t("subtitle")}</p>
          <a href="#products" className={cn(buttonClasses(), "mt-2 rounded-xl px-6 shadow-md shadow-brand-600/25")}>
            {t("cta")}
            <ForwardArrowIcon />
          </a>
        </div>

        <div aria-hidden className="pointer-events-none relative hidden h-full min-h-72 md:block">
          <p
            className={cn(
              "absolute start-0 top-0 -rotate-6 text-2xl leading-tight text-brand-700 lg:text-3xl",
              "font-[family-name:var(--font-hand-latin)]",
              "rtl:rotate-6 rtl:font-[family-name:var(--font-hand-arabic)] rtl:text-xl rtl:lg:text-2xl",
            )}
          >
            {t("noteLine1")}
            <br />
            {t("noteLine2")}
          </p>
          <NoteArrow className="absolute start-16 top-16 w-12 text-brand-700 lg:start-24 lg:top-20 lg:w-16 rtl:-scale-x-100" />
          <div className="absolute bottom-0 end-0 size-24 overflow-hidden rounded-2xl bg-white shadow-xl shadow-brand-700/15 ring-4 ring-white lg:size-28">
            <Image src={ACCENT_IMAGE} alt="" fill sizes="112px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
