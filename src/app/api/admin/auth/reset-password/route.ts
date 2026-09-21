import { pool } from "@/db";
import { hashPassword } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk, sha256 } from "@/lib/security";
import { adminPasswordSchema, zodMessage } from "@/lib/validation";
import { z } from "zod";

const schema = z.object({ token: z.string().min(40).max(200), password: adminPasswordSchema });

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  const passwordHash = await hashPassword(parsed.data.password);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const claimed = await client.query<{ user_id: number }>(
      "UPDATE password_reset_tokens SET used_at=NOW() WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW() RETURNING user_id",
      [sha256(parsed.data.token)]
    );
    if (!claimed.rowCount) {
      await client.query("ROLLBACK");
      return jsonError("پیوند بازیابی نامعتبر یا منقضی شده است", 400);
    }

    const userId = claimed.rows[0].user_id;
    await client.query("UPDATE users SET password_hash=$1,failed_login_count=0,locked_until=NULL,updated_at=NOW() WHERE id=$2", [passwordHash, userId]);
    await client.query("DELETE FROM admin_sessions WHERE user_id=$1", [userId]);
    await client.query("DELETE FROM sessions WHERE user_id=$1", [userId]);
    await client.query("INSERT INTO admin_activity_logs(admin_id,action,target_type,target_id,metadata) VALUES($1,'auth.password_reset','admin',$2,'{}'::jsonb)", [userId, String(userId)]);
    await client.query("COMMIT");
    return jsonOk();
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[admin/reset]", error);
    return jsonError("تغییر رمز انجام نشد", 500);
  } finally {
    client.release();
  }
}
