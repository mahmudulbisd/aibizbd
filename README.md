# Ai Biz BD — Automated Digital Reseller Platform

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Drizzle ORM (PostgreSQL) digital-delivery storefront.

## Getting started (local)

```bash
npm install
cp .env.example .env        # set DATABASE_URL + ENCRYPTION_KEY
npm run db:migrate          # apply migrations (tsx runner, non-pooled URL)
npm run db:seed             # load the product catalog
npm run dev                 # http://localhost:3000
```

Requires PostgreSQL (any host). With the default `PAYMENT_PROVIDER=mock` and
`FULFILLMENT_PROVIDER=mock`, the full checkout → payment → fulfillment →
credential-reveal flow runs with no external API keys.

## Deploying to Vercel (zero-friction database)

The app uses Drizzle with the **postgres.js** serverless driver. It auto-detects
the connection string from `POSTGRES_URL` (injected automatically by the Vercel
Postgres or Neon integration) or `DATABASE_URL` — no manual Supabase-style
connection string required.

1. Push this folder to GitHub and import it in Vercel (framework: Next.js).
2. Add a Postgres store: **Vercel Storage → Create → Postgres** (or Neon). This
   injects `POSTGRES_URL` into the project automatically.
3. Set the env vars listed in `vercel.json` / `.env.example`
   (`ENCRYPTION_KEY`, `FULFILLMENT_PROVIDER`, `PRODSELLER_API_KEY`, …).
4. Deploy — migrations run automatically before every build
   (`npm run db:migrate && next build`), so the schema is always current:
   ```bash
   npx vercel --prod
   ```
   To seed the product catalog once, after the first deploy run:
   ```bash
   npx vercel env pull .env.production.local && npm run db:seed
   ```

`vercel.json` pins the framework preset, install/build commands (migrations run
automatically before each build: `npm run db:migrate && next build`) and the
primary region (`sin1`, closest to Bangladesh). Static catalog pages use ISR;
webhook and order routes run server-side.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | End-to-end flow test (order → payment → fulfillment → reveal) on in-memory Postgres |
| `npm run db:generate` | Generate a Drizzle migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed the product catalog |
| `npm run db:studio` | Drizzle Studio UI |

## Architecture

- Storefront & catalog: `/` and `/products/[slug]`
- One-step guest checkout → `POST /api/checkout`
- Payment webhook: `POST /api/webhooks/payment` (routes to `mock` / `bkash` / `binance` provider)
- Order status + credential reveal: `/order/[orderNumber]`, backed by `GET /api/orders/[orderNumber]`
- Fulfillment engine: `src/lib/fulfillment.ts` → supplier adapter (`src/lib/supplier/`)
- Credentials are AES-256-GCM encrypted at rest (`src/lib/crypto.ts`); plaintext never hits the DB
- `npm test` runs the whole flow against PGlite (in-memory Postgres) — no database needed

See `.env.example` for all provider switches and keys.
