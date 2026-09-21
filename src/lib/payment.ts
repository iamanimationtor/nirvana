import { hmacHex, randomToken, safeEqual } from "@/lib/security";

export type GatewayMode = "zarinpal" | "demo";

export class PaymentConfigurationError extends Error {}

export function gatewayMode(): GatewayMode {
  const configured = process.env.PAYMENT_MODE?.trim().toLowerCase();
  const hasMerchant = Boolean(process.env.ZARINPAL_MERCHANT_ID?.trim() && process.env.ZARINPAL_MERCHANT_ID!.trim().length >= 32);

  if (configured && configured !== "demo" && configured !== "zarinpal") {
    throw new PaymentConfigurationError("PAYMENT_MODE must be demo or zarinpal");
  }
  if (configured === "demo") return "demo";
  if (configured === "zarinpal") {
    if (!hasMerchant) throw new PaymentConfigurationError("ZARINPAL_MERCHANT_ID is required when PAYMENT_MODE=zarinpal");
    return "zarinpal";
  }

  if (hasMerchant) return "zarinpal";
  if (process.env.NODE_ENV === "production") {
    throw new PaymentConfigurationError("Production checkout requires PAYMENT_MODE=zarinpal and ZARINPAL_MERCHANT_ID");
  }
  return "demo";
}

export function merchantId(): string {
  return process.env.ZARINPAL_MERCHANT_ID?.trim() ?? "";
}

export function isSandbox(): boolean {
  return process.env.ZARINPAL_SANDBOX === "true";
}

function endpoints() {
  if (isSandbox()) {
    return {
      request: "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
      verify: "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
      start: "https://sandbox.zarinpal.com/pg/StartPay/",
    };
  }
  return {
    request: "https://payment.zarinpal.com/pg/v4/payment/request.json",
    verify: "https://payment.zarinpal.com/pg/v4/payment/verify.json",
    start: "https://www.zarinpal.com/pg/StartPay/",
  };
}

type ZarinpalData = {
  code?: number;
  message?: string;
  authority?: string;
  ref_id?: number | string;
  card_pan?: string;
};

async function zarinpalPost(url: string, body: unknown): Promise<{
  data: ZarinpalData;
  errors: { code?: number; message?: string } | null;
}> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await response.json()) as { data?: ZarinpalData; errors?: { code?: number; message?: string } | unknown[] };
  const errors = Array.isArray(json.errors) ? null : (json.errors ?? null);
  return { data: json.data ?? {}, errors };
}

export async function requestZarinpalPayment(input: {
  amountRial: number;
  callbackUrl: string;
  description: string;
  email?: string;
  mobile?: string;
}): Promise<{ authority: string; startUrl: string }> {
  const endpoint = endpoints();
  const { data, errors } = await zarinpalPost(endpoint.request, {
    merchant_id: merchantId(),
    amount: input.amountRial,
    callback_url: input.callbackUrl,
    description: input.description.slice(0, 250),
    metadata: { email: input.email ?? "", mobile: input.mobile ?? "" },
  });
  if (errors?.message) throw new Error(errors.message);
  if (data.code !== 100 || !data.authority) throw new Error(data.message || "درگاه پرداخت پاسخ نامعتبر داد");
  return { authority: data.authority, startUrl: `${endpoint.start}${data.authority}` };
}

export async function verifyZarinpalPayment(input: {
  amountRial: number;
  authority: string;
}): Promise<{ refId: string; cardPan: string | null; alreadyVerified: boolean }> {
  const endpoint = endpoints();
  const { data, errors } = await zarinpalPost(endpoint.verify, {
    merchant_id: merchantId(),
    amount: input.amountRial,
    authority: input.authority,
  });
  if (errors?.message) throw new Error(errors.message);
  if (data.code === 101) return { refId: String(data.ref_id ?? ""), cardPan: data.card_pan ?? null, alreadyVerified: true };
  if (data.code !== 100) throw new Error(data.message || "تأیید پرداخت ناموفق بود");
  return { refId: String(data.ref_id ?? ""), cardPan: data.card_pan ?? null, alreadyVerified: false };
}

export function createDemoAuthority(): string {
  return `DEMO-${randomToken(16)}`;
}

export function signDemoAuthority(authority: string): string {
  return hmacHex(`pay:${authority}`);
}

export function checkDemoSignature(authority: string, token: string): boolean {
  if (!authority.startsWith("DEMO-") || !token) return false;
  return safeEqual(signDemoAuthority(authority), token);
}
