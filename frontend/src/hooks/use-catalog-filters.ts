"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { parseFilters, serializeFilters } from "@/lib/catalog-filters";
import type { ProductFilters } from "@/types/api";

export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const queryString = searchParams.toString();
  const filters = useMemo(() => parseFilters(new URLSearchParams(queryString)), [queryString]);

  const latestFilters = useRef(filters);
  useEffect(() => {
    latestFilters.current = filters;
  }, [filters]);

  const replaceFilters = useCallback(
    (next: ProductFilters) => {
      latestFilters.current = next;
      const query = serializeFilters(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const updateFilters = useCallback(
    (patch: Partial<ProductFilters>) => replaceFilters({ ...latestFilters.current, ...patch }),
    [replaceFilters],
  );

  const clearFilters = useCallback(() => replaceFilters({}), [replaceFilters]);

  return { filters, updateFilters, clearFilters };
}
