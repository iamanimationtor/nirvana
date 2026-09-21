# Admin architecture and operations

## Boundaries

The public store is in the `(store)` route group and receives its own client providers. `/admin` has a separate layout and bundle. Route grouping does not change public URLs. Admin pages perform session checks on the server; all mutations repeat authorization in their API handlers.

## RBAC

Permissions are normalized through `roles`, `permissions`, `role_permissions`, and `user_roles`. The legacy `users.role` field remains for backward compatibility and provides safe defaults until normalized assignments exist. `super_admin` is the only implicit all-access role. Customer registration always creates `customer`, and customer sessions never satisfy admin authentication.

## Inventory consistency

Stock mutations use row locks or conditional atomic updates. Payment verification is idempotent and conditionally decrements inventory, writes an inventory movement, order event, and low-stock notification in one transaction. Soft product deletion retains order references. Cancellation restores only inventory movements associated with the order, avoiding accidental restoration of legacy orders.

## Reporting semantics

Dashboard/report queries aggregate in PostgreSQL and use bounded date ranges. `revenue` means paid order value. `net sales` subtracts completed refunds. Profit is deliberately not shown because cost-of-goods data does not exist.

## Uploads

The included adapter validates size, MIME type, and magic bytes; randomizes filenames; and rejects SVG/executable content. It stores files under `public/uploads/products` in local development and uses a strongly consistent site-scoped Netlify Blobs store on Netlify. Public image bytes are served through `/api/media/[key]` with immutable caching, so uploads persist across Netlify deploys without relying on the ephemeral function filesystem.

## Deployment checklist

1. Provision PostgreSQL and TLS.
2. Set all required environment values, especially a random `AUTH_SECRET` and canonical `APP_URL`.
3. Run `npm ci`, `npm run db:migrate`, and the one-time admin bootstrap.
4. Configure `PAYMENT_MODE=zarinpal`, `ZARINPAL_MERCHANT_ID`, and a production callback `APP_URL` before accepting payments. Demo mode is only for local/staging checks.
5. Configure `PASSWORD_RESET_WEBHOOK_URL` to an authenticated transactional-email adapter.
6. Netlify deployments persist catalog uploads in Netlify Blobs; back up PostgreSQL and the media store, then test restore regularly.
7. Put distributed rate limiting at the edge when deploying more than one app process. Database account lockout remains effective across processes.
8. Run verification commands from the README in CI.

## Deliberate infrastructure choices

No Redis, queue, search cluster, or microservice was added. PostgreSQL indexes, transactional writes, server pagination, and Next route splitting are sufficient for the current application. Add distributed caching/queues only after measured load requires them.
