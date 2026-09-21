# Nirvana 3D Store & Admin

Next.js 16 / React 19 / PostgreSQL e-commerce storefront with a separate, server-authorized Persian admin panel.

## Local setup

1. Copy `.env.example` to `.env.local` and set a real PostgreSQL URL and `AUTH_SECRET`.
2. `npm ci`
3. `npm run db:migrate`
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), and `ADMIN_NAME`, then run `npm run admin:bootstrap` once.
5. `npm run dev`
6. Open `/admin/login`.

Never expose bootstrap credentials to browser code or commit an environment file. Product uploads use local `public/uploads` during development and Netlify Blobs automatically when deployed on Netlify; both are served through `/api/media/[key]`, so runtime-written files work with `next start` and Netlify images persist across deploys.

## Security model

Customer and administrator sessions use separate opaque, hashed database tokens. Admin cookies are HTTP-only, SameSite Strict, scoped to `/admin`, and expire after eight hours. Every admin API performs server-side permission checks and same-origin validation. Product deletion is soft so historical order data remains intact.

## Database

Drizzle migrations are in `drizzle/`. Run migrations during deployment before starting the app. Existing installations created before migrations should be backed up and reconciled with `npm run db:push` in a staging copy before production migration.

## Netlify deployment

The project now builds safely when no database is configured, so a storefront preview can be deployed without placing a database URL in source control. It will use the built-in catalog fallback; database-backed features (authentication, checkout, orders, and `/admin`) require PostgreSQL.

For a production store, add these secrets in **Site configuration → Environment variables** with availability for builds and server functions:

- `DATABASE_URL` — TLS PostgreSQL connection string
- `AUTH_SECRET` — at least 32 random characters
- `APP_URL` — the canonical HTTPS site URL
- `PAYMENT_MODE=zarinpal` and `ZARINPAL_MERCHANT_ID` — required before accepting real payments; demo mode is for local/staging only
- `PASSWORD_RESET_WEBHOOK_URL` — required for production password-recovery delivery

Do not put secret values in `netlify.toml` or commit an `.env` file. After adding or changing variables, trigger a new deploy. Apply the Drizzle migrations to the production database separately before accepting traffic.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```
