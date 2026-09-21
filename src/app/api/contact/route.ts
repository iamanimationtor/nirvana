import { db } from "@/db";
import { messages } from "@/db/schema";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  clientIp,
  hashIp,
  jsonError,
  jsonOk,
  sanitizeText,
} from "@/lib/security";
import { contactSchema, zodMessage } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const limited = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = contactSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));
    await db.insert(messages).values({
      name: sanitizeText(parsed.data.name, 80),
      contact: sanitizeText(parsed.data.contact ?? "", 120),
      body: sanitizeText(parsed.data.body, 2000),
      ipHash: hashIp(ip),
    });
    return jsonOk();
  } catch (err) {
    console.error("[api/contact]", err);
    return jsonError("خطای سرور", 500);
  }
}
