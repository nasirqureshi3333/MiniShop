# Frontend — Mini E-Commerce Product Catalog

Next.js 16 (App Router) client for the FastAPI product API. See the [root README](../README.md) for the full
developer guide.

```bash
npm install
npm run dev                  # http://localhost:3000 (API URL from .env.development)
```

| Script              | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server              |
| `npm run build`     | Static build to `out/`, served by the backend at http://localhost:8000 (no backend needed to build) |
| `npm test`          | Vitest unit and component tests |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript type check           |
