import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "destructive";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:hover:bg-brand-600",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:hover:bg-white",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "text-red-600 hover:bg-red-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

export function buttonClasses({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}
