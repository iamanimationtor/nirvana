import { randomToken } from "@/lib/security";

export function newPublicOrderId(): string {
  return `NV-${randomToken(5).toUpperCase()}`;
}
