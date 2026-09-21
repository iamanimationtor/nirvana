import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp, jsonError, jsonOk } from "@/lib/security";
import { newsletterSchema, zodMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const limited = rateLimit(`news:${ip}`, 6, 15 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = newsletterSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));
    // Subscription is intentionally idempotent: a repeat submission should
    // succeed without leaking whether an address is already subscribed.
    await db.insert(subscribers).values({ email: parsed.data.email }).onConflictDoNothing({ target: subscribers.email });
    return jsonOk();
  } catch (err) {
    console.error("[api/newsletter]", err);
    return jsonError("خطای سرور", 500);
  }
}
