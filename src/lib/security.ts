import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
export { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be at least 32 characters in production");
  }
  const seed = process.env.DATABASE_URL || "nirvana-local";
  return createHash("sha256").update(`nirvana-development-only:${seed}`).digest("hex");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacHex(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashSessionToken(token: string): string {
  return hmacHex(`session:${token}`);
}

export function hashIp(ip: string): string {
  return sha256(`${getAuthSecret()}:ip:${ip}`).slice(0, 32);
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function sanitizeText(input: string, max = 200): string {
  return input.replace(/[\u0000-\u001F<>]/g, "").trim().slice(0, max);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.slice(0, 64);
  return "0.0.0.0";
}

export function userAgent(request: Request): string {
  return (request.headers.get("user-agent") ?? "").slice(0, 180);
}

/** Reject cross-site POSTs. Same-origin or missing origin (native clients) allowed only if referer matches. */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  const allowed = new Set<string>();
  allowed.add(`https://${host}`);
  allowed.add(`http://${host}`);
  const app = process.env.APP_URL?.replace(/\/$/, "");
  if (app) allowed.add(app);

  if (origin) return allowed.has(origin);

  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return allowed.has(`${url.protocol}//${url.host}`);
  } catch {
    return false;
  }
}

export function appBaseUrl(request: Request): string {
  // Netlify provides a unique URL per Deploy Preview. Prefer it for callback
  // URLs so a preview checkout never sends a customer to the production site.
  const netlifyContext = process.env.CONTEXT;
  const previewUrl = (netlifyContext === "deploy-preview" || netlifyContext === "branch-deploy")
    ? process.env.DEPLOY_PRIME_URL?.replace(/\/$/, "")
    : undefined;
  if (previewUrl) return previewUrl;
  const env = process.env.APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(extra?: T) {
  return Response.json({ ok: true, ...(extra ?? {}) });
}
