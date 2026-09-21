import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Lightweight readiness endpoint for uptime checks and deployment diagnostics. */
export async function GET() {
  if (!isDatabaseConfigured) {
    return Response.json({ ok: false, database: "not_configured" }, { status: 503 });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[health] database unavailable", error);
    return Response.json({ ok: false, database: "unavailable" }, { status: 503 });
  }
}
