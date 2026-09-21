import { getCurrentUser } from "@/lib/auth";
import { jsonOk } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return jsonOk({ user });
}
