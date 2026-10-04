import { config } from "@/lib/config";

import { ApiError, isApiErrorResponse } from "./api-error";

export type QueryParams = Record<string, string | number | undefined | null>;

interface RequestOptions {
  params?: QueryParams;
  signal?: AbortSignal;
}

export function buildUrl(path: string, params: QueryParams = {}): string {
  const base = typeof window === "undefined" ? undefined : window.location.origin;
  const url = new URL(`${config.apiUrl}${path}`, base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function withTimeout(signal: AbortSignal | undefined): AbortSignal {
  const timeout = AbortSignal.timeout(config.apiTimeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function parseError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  if (isApiErrorResponse(body)) {
    return new ApiError(response.status, body.error.code, body.error.message, body.error.details);
  }
  return new ApiError(response.status, "http_error", response.statusText || `Request failed with status ${response.status}`);
}

export async function apiGet<T>(path: string, { params, signal }: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      headers: { Accept: "application/json" },
      signal: withTimeout(signal),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    throw new ApiError(0, isTimeout ? "timeout" : "network_error", isTimeout ? "Request timed out" : "Network error");
  }

  if (!response.ok) throw await parseError(response);
  return (await response.json()) as T;
}
