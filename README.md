# Mini E-Commerce Product Catalog

A bilingual (English / Arabic) product catalog with a **Next.js** frontend and a **FastAPI** backend.
Users can browse, search, filter and sort products, view product details and manage a shopping cart.
The whole UI supports LTR and RTL layouts.

| Layer    | Stack                                                                      |
| -------- | -------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-intl, TanStack Query |
| Backend  | Python 3.11+, FastAPI, Pydantic v2, static JSON data                       |
| Testing  | pytest (backend), Vitest + React Testing Library (frontend)                |

---

## 1. Prerequisites

- **Python** 3.11 or newer
- **Node.js** 20.9 or newer (with npm)

## 2. Installation (once)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows (PowerShell / cmd)
pip install -r requirements-dev.txt
cp .env.example .env             # optional, the defaults work for local development

# Frontend
cd ../frontend
npm install
# No env file needed: .env.development (npm run dev) and .env.production (npm run build) hold the API URL.
```

## 3. Running the application

There are two ways to run the app. The frontend follows the usual Next.js static-export setup: `npm run build` writes
plain files to `frontend/out/`, and the FastAPI backend serves that folder at its own URL.

| | **A. Separate frontend and backend** (development) | **B. Frontend served by the backend** (one URL) |
| --- | --- | --- |
| URLs | Site `http://localhost:3000`, API `http://localhost:8000` | Everything on `http://localhost:8000` |
| Commands | `uvicorn …` **and** `npm run dev` | `npm run build` once, then `uvicorn …` only |
| Frontend | Next.js dev server with hot reload | Static files in `frontend/out/` |

### A. Separate frontend and backend

```bash
# Terminal 1: backend at http://localhost:8000
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: frontend at http://localhost:3000
cd frontend
npm run dev
```

Open **http://localhost:3000**. You are redirected to `/en` (or `/ar` if your browser prefers Arabic, or if you chose
Arabic before).

### B. Frontend served by the backend (one URL)

```bash
# 1. Build the frontend. This writes static files to frontend/out/ (the backend does not need to be running).
cd frontend
npm run build

# 2. Start (or restart) the backend. It serves frontend/out/ automatically.
cd backend
uvicorn app.main:app --port 8000
```

Open **http://localhost:8000**. The backend serves both the site and the API:

| URL | Served by |
| --- | --- |
| `/api/...`, `/docs`, `/openapi.json` | The API, unchanged and always handled first |
| `/` | Redirect to `/en` or `/ar`: saved language first, then the browser language |
| `/en`, `/ar/cart`, `/en/product?id=3`, ... | Pages from `frontend/out/` |
| `/cart` (no language) | Redirect to `/en/cart` or `/ar/cart` |
| Unknown page, e.g. `/en/nope` | Localized "not found" page with a **404** status |

Good to know:

- **When `frontend/out/` exists, the backend serves it automatically** (`backend/app/frontend.py`). If it doesn't
  exist, the backend is API-only. Delete the folder to go back to API-only.
- **The build never calls the backend.** All data, including products, images, categories and stock, is fetched by
  the browser from the API at runtime. Product changes in `products.json` show up without rebuilding. Rebuild only
  after changing frontend code.
- **API URL:** `npm run build` uses `/api` (`frontend/.env.production`). The browser calls the API on the same origin
  that served the page, so one build works on localhost, in Docker and on any domain. `npm run dev` uses
  `http://localhost:8000/api` (`frontend/.env.development`). Create `frontend/.env.local` only to override these.
- **Images:** Next.js's image optimizer needs a Node.js server, so the build resizes images through Unsplash's CDN
  instead.
- **Build notice:** during `npm run build`, Next.js says static export "disables API routes and middleware". That's
  expected. The language redirect is done by the backend instead.
- **OneDrive:** in a folder synced by OneDrive, a rebuild can occasionally fail with `EBUSY` while OneDrive is syncing
  `out/`. Run `npm run build` again.

## 4. Configuration

| App      | Variable              | Default                     | Description                                       |
| -------- | --------------------- | --------------------------- | ------------------------------------------------- |
| Backend  | `CORS_ORIGINS`        | `http://localhost:3000`     | Comma-separated origins allowed to call the API (mode A). |
| Backend  | `PRODUCTS_FILE`       | `app/data/products.json`    | Path to the static product data.                  |
| Backend  | `FRONTEND_DIR`        | `../frontend/out`           | Static frontend served at `/` (mode B). Ignored if the folder does not exist. |
| Frontend | `NEXT_PUBLIC_API_URL` | dev: `http://localhost:8000/api`, build: `/api` | API base URL used by the browser (set in `.env.development` / `.env.production`). |

The frontend reads the API URL in exactly one place (`src/lib/config.ts`). It fails fast with a clear message if the
variable is missing.

## 5. Running tests and checks

```bash
# Backend
cd backend
python -m pytest

# Frontend
cd frontend
npm test            # Vitest unit and component tests
npm run lint        # ESLint
npm run typecheck   # TypeScript
```

---

## 6. API reference

All content endpoints accept `lang=en|ar` (default `en`) and return text in that language.

| Method | Endpoint                     | Description                                                     |
| ------ | ---------------------------- | --------------------------------------------------------------- |
| GET    | `/api/products`              | List products. Supports search, category, price range and sorting. |
| GET    | `/api/products/{product_id}` | Get one product. Returns `404` if it does not exist.            |
| GET    | `/api/categories`            | Unique categories derived from the product data.                |
| GET    | `/api/health`                | Health check, returns `{"status": "healthy"}`.                  |

### `GET /api/products` query parameters (all optional)

| Parameter   | Type             | Description                                                              |
| ----------- | ---------------- | ------------------------------------------------------------------------ |
| `lang`      | `en` \| `ar`     | Response language.                                                       |
| `search`    | string (≤ 100)   | Case-insensitive match on the product name in the requested language.   |
| `category`  | string (≤ 100)   | Category slug (`electronics`) or name in English or Arabic, case-insensitive. |
| `min_price` | number ≥ 0       | Inclusive minimum price.                                                 |
| `max_price` | number ≥ 0       | Inclusive maximum price. Must be ≥ `min_price`.                          |
| `sort`      | `asc` \| `desc`  | Sort by price. Without it, products keep catalog order.                  |

Examples:

```
GET /api/products?lang=ar&search=سماعات
GET /api/products?lang=en&category=Electronics&min_price=20&max_price=100&sort=desc
GET /api/products/1?lang=ar
GET /api/categories?lang=ar
```

Response shape:

```json
{
  "total": 1,
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "Over-ear Bluetooth wireless headphones…",
      "price": 79.99,
      "category": { "slug": "electronics", "name": "Electronics" },
      "image": "https://images.unsplash.com/photo-…",
      "stock": 15,
      "in_stock": true
    }
  ]
}
```

### Errors

Every error uses the same envelope:

```json
{
  "error": {
    "code": "validation_error",
    "message": "One or more request parameters are invalid.",
    "details": [{ "field": "lang", "location": "query", "message": "Input should be 'en' or 'ar'", "type": "enum" }]
  }
}
```

| Situation                                                     | Status | `code`               |
| ------------------------------------------------------------- | ------ | -------------------- |
| Product does not exist (`/api/products/999`)                  | 404    | `not_found`          |
| Invalid product id (`abc`, `0`, `-1`, `1.5`)                  | 422    | `validation_error`   |
| Unsupported language (`lang=fr`)                              | 422    | `validation_error`   |
| Invalid price (`abc`, negative, `inf`, `nan`) or `min_price > max_price` | 422 | `validation_error` |
| Invalid sort value (`sort=up`)                                | 422    | `validation_error`   |
| Unknown query parameter (`?colour=red`)                       | 422    | `validation_error`   |
| Unknown route / unsupported method                            | 404 / 405 | `not_found` / `method_not_allowed` |
| Unexpected server error                                       | 500    | `internal_error`     |

Swagger documents every endpoint with descriptions, typed parameters, response schemas, status codes, error examples,
and **English and Arabic response examples**. You can call each endpoint directly from Swagger with "Try it out".

---

## 7. Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                  # App factory: CORS, error handlers, routers, eager data load
│   │   ├── frontend.py              # Serves the static frontend build at "/" (single-URL mode)
│   │   ├── core/                    # Settings, domain exceptions, exception → HTTP handlers
│   │   ├── api/
│   │   │   ├── routes/              # products.py, categories.py, health.py (thin HTTP layer)
│   │   │   ├── dependencies.py      # Dependency injection (repository → service)
│   │   │   └── openapi.py           # Swagger responses and EN/AR examples
│   │   ├── schemas/                 # API contracts: query models, responses, error envelope
│   │   ├── models/                  # Internal data model of products.json (bilingual)
│   │   ├── repositories/            # Loads and validates the JSON file, in-memory lookups
│   │   ├── services/                # Business logic: search, filter, sort, localization
│   │   └── data/products.json       # 15 bilingual products in 5 categories
│   └── tests/                       # pytest suite (endpoints, validation, repository, OpenAPI, static site)
└── frontend/
    ├── messages/{en,ar}.json        # All UI translations
    ├── out/                         # `npm run build` output, served by the backend (git-ignored)
    └── src/
        ├── app/[locale]/            # Routes: / (listing), /product?id=…, /cart, not-found, error
        ├── components/              # layout/, products/, cart/, ui/, providers/
        ├── hooks/                   # Data queries, URL filters, cart, debounce, price formatting
        ├── i18n/                    # next-intl routing, navigation and request config
        ├── lib/                     # API client, cart store/reducer, filter parsing, config
        ├── types/api.ts             # Types mirroring the API schemas
        └── proxy.ts                 # Locale detection / redirect (Next.js 16 "proxy", formerly middleware)
```

## 8. Design decisions

### Backend

- **Layered architecture.** Routes → service → repository. Routes only handle HTTP concerns. Business rules live in
  `ProductService`, and data access is isolated in `ProductRepository`, so the JSON file could be swapped for a
  database without touching routes.
- **Validated data, fail fast.** `products.json` is parsed into strict Pydantic models at startup: required EN/AR
  text, non-negative price and stock, valid image URL, unique ids. Bad data stops the server with a clear error
  instead of causing 500s at request time.
- **Query parameter models** (`schemas/query.py`). They keep validation in one place and use `extra="forbid"`, so a
  typo such as `?sortt=asc` is reported instead of silently ignored. Blank `search`/`category` values mean "no filter".
- **Categories are derived, not hardcoded.** They are computed from the product data. Each has a language-independent
  `slug`, so the frontend's category filter keeps working when the language changes.
- **One error envelope** for validation errors, domain errors (e.g. product not found), unknown routes and
  unexpected exceptions.

### Frontend

- **Locale in the URL** (`/en/...`, `/ar/...`) via next-intl. `<html lang dir>` is rendered on the server, so RTL
  never flickers. Links are shareable, and the choice survives refreshes. A one-year locale cookie also brings
  visitors back to their language on `/`.
- **RTL done with logical CSS** (`ms-*`, `ps-*`, `start-*`, `end-*`, `text-start`) and `rtl:` variants, e.g. the
  mirrored "back" arrow. Arabic currency symbols are wrapped in Unicode bidi isolates so "US$" is not reordered
  to "$US".
- **Server state with TanStack Query.** It caches per language and filter set, cancels stale requests, retries only
  transient failures (never 4xx), and keeps previous results visible while a new filter loads. The UI has explicit
  loading (skeletons), empty, error and not-found states. Error messages distinguish an unreachable server (with
  "Try again"), invalid filters (with "Clear filters") and server errors.
- **All data is loaded in the browser, from the API.** The frontend builds to static files without contacting the
  backend, like a classic single-page app. The product details page is one static page, `/product?id=3`, that reads the
  id from the URL and fetches the product. An invalid or unknown id shows a localized "Product not found" message, and
  the browser tab shows the product's name once it has loaded.
- **Filters live in the URL query string**, so they are shareable, survive refresh and work with back/forward. Search
  is debounced (300 ms). The price range is applied explicitly, and an invalid range is rejected with a visible
  error. Hand-edited URLs are normalized rather than causing errors:
  - an inverted price range is swapped;
  - over-long text is cut to the API's 100-character limit;
  - a category name such as `Electronics` is converted to its slug, and an unknown category is removed;
  - an invalid sort value is ignored.
- **"Back to Products" restores your filters.** The last listing URL is remembered per browser tab
  (sessionStorage). If the language changed in between, the search term is dropped.
- **Cart = ids + quantities in localStorage**, managed by a pure reducer behind a `useSyncExternalStore` store. As a
  result:
  - Product names, prices and stock are always fetched fresh in the current language. The cart is fully translated
    after a language switch.
  - **Totals only count what can be bought.** The header badge, "Total items" and the subtotal all come from the same
    summary (`lib/cart/cart-summary.ts`). If stock drops below the stored quantity, the quantity is reduced
    automatically. Out-of-stock and removed products are shown but excluded from totals, and can be removed in one
    click. "Clear cart" asks for confirmation first.
  - Stored data is validated defensively. Rendering is hydration-safe, and the cart stays in sync across browser tabs.
  - The subtotal is computed in integer cents, which avoids floating-point drift.
- **Landing hero.** The products page opens with a translated banner, and "Shop Now" jumps to the catalog. The
  product scene is photographed on a flat lavender backdrop. The banner gradient ends in that same colour and the
  photo's inner edge is masked out, so the product appears to sit inside the banner, mirrored for RTL. The handwritten
  note uses decorative fonts (Caveat / Aref Ruqaa) that are not preloaded. The banner images are decorative marketing
  shots kept in `components/home/hero.tsx`. All product data, including the catalog images, still comes from the API.
- **Image zoom.** On the product page, hovering with a mouse zooms the photo 2.5× inside its frame, with a
  crosshair cursor. The zoom follows the cursor through `transform-origin`, updated at most once per animation frame,
  and eases back in 0.3s when the mouse leaves. A 1600px version of the image loads on the first hover only, and
  zoom state is tracked per image, so swapping images starts clean. Touch devices keep the
  plain image, and the effect respects `prefers-reduced-motion`. Product cards zoom slightly on hover.
- **Fonts per script.** Inter is used for English and Noto Sans Arabic for Arabic. The order matters: next/font's
  metric-adjusted Inter fallback is built from Arial, which contains Arabic glyphs and would otherwise be used for
  Arabic text.
- **Accessibility:** semantic landmarks, a skip link, labelled controls, `aria-live` announcements for cart changes
  and result counts, and visible keyboard focus rings on every control. Each product card exposes a single link: the
  "View Details" link is stretched over the whole card, so the card is clickable anywhere.
- **Hydration warnings from browser extensions are suppressed** on `<html>` and `<body>` only
  (`suppressHydrationWarning`). Extensions inject attributes there before React loads. The suppression is one level
  deep, so real mismatches in the app still surface.

## 9. Assumptions

- Prices are in USD.
- Checkout, payment and authentication are out of scope (as stated in the requirements).
- Search matches the product **name** in the active language, as specified. When the language is switched, any
  active search term is cleared because it would not match the other language. Category, sort and price filters are
  kept.
- Product images are hosted on Unsplash, so an internet connection is required to see them. A placeholder is shown
  if an image fails to load.
