import { createAdminSession, isAdminRole } from "@/lib/admin-auth";
import { findUserByEmail, isLocked, recordFailedLogin, recordSuccessfulLogin, verifyPassword } from "@/lib/auth";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp, jsonError, jsonOk, userAgent } from "@/lib/security";
import { loginSchema, zodMessage } from "@/lib/validation";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));
    const user = await findUserByEmail(parsed.data.email);
    const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : await verifyPassword(parsed.data.password, "$2a$12$C6UzMDM.H6dfI/f/IKxG3OBhZcl3LkdOqeMBFOYrV6efMFa9Ez5eK");
    if (!user || !valid || !isAdminRole(user.role) || user.status !== "active") {
      if (user && !valid) await recordFailedLogin(user.id);
      return jsonError("ایمیل یا رمز عبور نادرست است", 401);
    }
    if (isLocked(user)) return jsonError("حساب موقتاً قفل شده است", 423);
    await recordSuccessfulLogin(user.id, ip);
    await createAdminSession(user.id, ip, userAgent(request));
    return jsonOk({ redirect: "/admin" });
  } catch (error) {
    console.error("[admin/login]", error);
    return jsonError("ورود انجام نشد", 500);
  }
}
