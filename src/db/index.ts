import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

const DATABASE_URL_ERROR =
  "DATABASE_URL is not configured. Add it to the deployment environment before using database-backed features.";

/** Whether this deployment can use the PostgreSQL-backed features. */
export const isDatabaseConfigured = Boolean(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function unavailableResource<T extends object>(): T {
  return new Proxy({} as T, {
    get() {
      throw new Error(DATABASE_URL_ERROR);
    },
  });
}

const configuredPool = databaseUrl
  ? globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    })
  : undefined;

if (configuredPool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = configuredPool;
}

/**
 * The proxy makes module loading safe during a build without a database.
 * Any request that actually needs PostgreSQL still fails with an actionable
 * configuration error instead of silently connecting to a local database.
 */
export const pool: Pool = configuredPool ?? unavailableResource<Pool>();

export const db: ReturnType<typeof drizzle> = configuredPool
  ? drizzle(configuredPool)
  : unavailableResource<ReturnType<typeof drizzle>>();
