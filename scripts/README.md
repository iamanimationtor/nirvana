# Database upgrade

For databases created before the Drizzle migrations were introduced:

1. Stop application writes and take a verified PostgreSQL backup.
2. Test the backup restore in a non-production environment.
3. Set the normal `DATABASE_URL` and run:

```sh
CONFIRM_LEGACY_UPGRADE=yes npm run db:upgrade-legacy
```

The guarded runner executes `legacy-upgrade.sql` in a transaction, preserves legacy rows while adding/backfilling the current schema, records migration `0000` as the adopted baseline, and then applies later Drizzle migrations. The SQL is designed to be re-runnable, but a backup is still mandatory.

Do not run `drizzle-kit push` against a legacy production database. Fresh databases should continue to use `npm run db:migrate`.
