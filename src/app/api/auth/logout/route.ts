import { destroySession } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  try {
    await destroySession();
    return jsonOk();
  } catch (err) {
    console.error("[auth/logout]", err);
    return jsonError("خروج انجام نشد", 500);
  }
}
