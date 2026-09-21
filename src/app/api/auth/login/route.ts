import { createSession, findUserByEmail, isLocked, recordFailedLogin, recordSuccessfulLogin, verifyPassword } from "@/lib/auth";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp, jsonError, jsonOk, userAgent } from "@/lib/security";
import { loginSchema, zodMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

const GENERIC = "ایمیل یا رمز عبور نادرست است";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const limited = rateLimit(`login:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      await verifyPassword(parsed.data.password, "$2a$12$C6UzMDM.H6dfI/f/IKxG3OBhZcl3LkdOqeMBFOYrV6efMFa9Ez5eK");
      return jsonError(GENERIC, 401);
    }
    if (user.status !== "active") return jsonError(GENERIC, 401);
    if (isLocked(user)) {
      return jsonError("حساب موقتاً قفل شده است. ۱۵ دقیقه دیگر تلاش کنید.", 423);
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      await recordFailedLogin(user.id);
      return jsonError(GENERIC, 401);
    }

    await recordSuccessfulLogin(user.id, ip);
    await createSession(user.id, ip, userAgent(request));
    return jsonOk({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    return jsonError("ورود انجام نشد", 500);
  }
}
