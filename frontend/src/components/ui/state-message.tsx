import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { AlertIcon, SearchIcon } from "./icons";

interface StateMessageProps {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
  icon?: ReactNode;
  className?: string;
}

export function StateMessage({ title, description, action, tone = "neutral", icon, className }: StateMessageProps) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          isError ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600",
        )}
      >
        {icon ?? (isError ? <AlertIcon /> : <SearchIcon />)}
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
