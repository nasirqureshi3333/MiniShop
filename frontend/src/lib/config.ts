const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local and configure it.");
}

export const config = {
  apiUrl: apiUrl.replace(/\/+$/, ""),
  apiTimeoutMs: 10_000,
  currency: "USD",
} as const;
