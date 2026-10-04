import { describe, expect, it } from "vitest";

import { ApiError } from "./api-error";
import { getErrorMessageKey } from "./error-messages";

describe("getErrorMessageKey", () => {
  it.each([
    [new ApiError(0, "network_error", "Network error"), "networkError"],
    [new ApiError(422, "validation_error", "Invalid"), "invalidRequest"],
    [new ApiError(503, "http_error", "Unavailable"), "serverError"],
    [new Error("unexpected"), "serverError"],
  ])("maps %o to %s", (error, expected) => {
    expect(getErrorMessageKey(error)).toBe(expected);
  });
});
