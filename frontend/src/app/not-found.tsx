import Link from "next/link";

import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 text-center">
        <main>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <Link href="/" className="mt-4 inline-block text-brand-600 underline">
            Go to products
          </Link>
        </main>
      </body>
    </html>
  );
}
