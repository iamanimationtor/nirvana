import { z } from "zod";
import { db } from "@/db";
import { adminActivityLogs, settings } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";
import { assertSameOrigin, clientIp, hashIp, jsonError, jsonOk, sanitizeText } from "@/lib/security";
import { emailSchema, zodMessage } from "@/lib/validation";

const schema = z.object({
  "store.name": z.string().trim().min(2).max(100),
  "store.email": emailSchema.or(z.literal("")),
  "store.phone": z.string().trim().max(30),
  "store.currency": z.string().trim().min(1).max(20),
  "inventory.defaultThreshold": z.coerce.number().int("آستانه انبار باید عدد صحیح باشد").min(0, "آستانه انبار نمی‌تواند منفی باشد").max(1_000_000, "آستانه انبار بیش از حد بزرگ است"),
  "orders.shippingFee": z.coerce.number().int("هزینه ارسال باید عدد صحیح باشد").min(0, "هزینه ارسال نمی‌تواند منفی باشد").max(100_000_000, "هزینه ارسال بیش از حد بزرگ است"),
  "seo.defaultTitle": z.string().trim().min(2).max(100),
  "seo.defaultDescription": z.string().trim().min(2).max(300),
});

export async function PUT(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const auth = await requireAdminApi("settings.manage");
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));
  const values = Object.entries(parsed.data).map(([key, value]) => [key, typeof value === "string" ? sanitizeText(value, 300) : value] as const);

  await db.transaction(async (transaction) => {
    for (const [key, value] of values) {
      await transaction.insert(settings).values({
        key,
        value,
        group: key.split(".")[0],
        updatedBy: auth.admin.id,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedBy: auth.admin.id, updatedAt: new Date() },
      });
    }
    await transaction.insert(adminActivityLogs).values({
      adminId: auth.admin.id,
      action: "settings.updated",
      targetType: "settings",
      metadata: { keys: values.map(([key]) => key) },
      ipHash: hashIp(clientIp(request)),
    });
  });
  return jsonOk();
}
