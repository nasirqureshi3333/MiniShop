import { ApiError } from "./api-error";

export type ErrorMessageKey = "networkError" | "invalidRequest" | "serverError";

export function getErrorMessageKey(error: unknown): ErrorMessageKey {
  if (error instanceof ApiError) {
    if (error.status === 0) return "networkError";
    if (error.isClientError) return "invalidRequest";
  }
  return "serverError";
}
