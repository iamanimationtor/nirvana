import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIp,
  jsonError,
  jsonOk,
  sanitizeText,
} from "@/lib/security";
import { profileSchema, zodMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("وارد حساب نشده‌اید", 401);

  const limited = rateLimit(`profile:${user.id}`, 10, 10 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));
    const name = sanitizeText(parsed.data.name, 80);
    const phone = parsed.data.phone ? parsed.data.phone : null;
    await db
      .update(users)
      .set({ name, phone, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    return jsonOk({ user: { ...user, name, phone } });
  } catch (err) {
    console.error("[auth/profile]", err);
    return jsonError("ذخیره نشد", 500);
  }
}
