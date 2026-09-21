import { z } from "zod";
import { db } from "@/db";
import { adminActivityLogs, users } from "@/db/schema";
import { canAssignAdminRole, requireAdminApi } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import { assertSameOrigin, clientIp, hashIp, jsonError, jsonOk, sanitizeText } from "@/lib/security";
import { adminPasswordSchema, emailSchema } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: adminPasswordSchema,
  role: z.string(),
});

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const auth = await requireAdminApi("users.create");
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0].message);
  if (!canAssignAdminRole(auth.admin.role, parsed.data.role)) return jsonError("اجازه تخصیص این نقش را ندارید", 403);

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const [user] = await db.transaction(async (transaction) => {
      const rows = await transaction.insert(users).values({
        name: sanitizeText(parsed.data.name, 80),
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      }).returning({ id: users.id, email: users.email });
      await transaction.insert(adminActivityLogs).values({
        adminId: auth.admin.id,
        action: "admin.created",
        targetType: "admin",
        targetId: String(rows[0].id),
        metadata: { email: rows[0].email, role: parsed.data.role },
        ipHash: hashIp(clientIp(request)),
      });
      return rows;
    });
    return jsonOk({ user });
  } catch (error) {
    console.error("[admin/users]", error);
    return jsonError("این ایمیل قبلاً ثبت شده است", 409);
  }
}
