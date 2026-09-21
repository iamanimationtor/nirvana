import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, findUserByEmail, hashPassword } from "@/lib/auth";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIp,
  jsonError,
  jsonOk,
  sanitizeText,
  userAgent,
} from "@/lib/security";
import { registerSchema, zodMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const limited = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const email = parsed.data.email;
    const existing = await findUserByEmail(email);
    if (existing) return jsonError("این ایمیل قبلاً ثبت شده است", 409);

    const name = sanitizeText(parsed.data.name, 80);
    const phone = parsed.data.phone ? parsed.data.phone : null;
    const passwordHash = await hashPassword(parsed.data.password);

    const inserted = await db
      .insert(users)
      .values({ email, name, phone, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role });

    const user = inserted[0];
    await createSession(user.id, ip, userAgent(request));
    return jsonOk({ user });
  } catch (err) {
    console.error("[auth/register]", err);
    return jsonError("ثبت‌نام انجام نشد", 500);
  }
}
