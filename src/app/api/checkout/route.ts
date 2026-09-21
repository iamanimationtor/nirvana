import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { addresses, orderItems, orders, payments, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { newPublicOrderId } from "@/lib/orders";
import {
  createDemoAuthority,
  gatewayMode,
  PaymentConfigurationError,
  requestZarinpalPayment,
  signDemoAuthority,
} from "@/lib/payment";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import {
  appBaseUrl,
  assertSameOrigin,
  clientIp,
  jsonError,
  jsonOk,
  sanitizeText,
} from "@/lib/security";
import { checkoutSchema, zodMessage } from "@/lib/validation";
import {getStoreSettings,numericSetting} from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const ip = clientIp(request);
  const user = await getCurrentUser();
  const limited = rateLimit(`checkout:${user?.id ?? ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return limitedResponse(limited.retryAfterMs);

  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(zodMessage(parsed.error));

    const ids = [...new Set(parsed.data.items.map((i) => i.id))];
    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(catalog.map((p) => [p.id, p]));

    const lines: {
      productId: number;
      slug: string;
      name: string;
      unitPrice: number;
      qty: number;
      image: string;
      sku: string;
    }[] = [];
    let total = 0;

    for (const item of parsed.data.items) {
      const product = byId.get(item.id);
      if (!product || product.deletedAt || product.status !== "active") return jsonError("یکی از محصولات دیگر قابل فروش نیست");
      if (product.stock < item.qty) {
        return jsonError(`موجودی «${product.name}» کافی نیست`);
      }
      lines.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: Math.round(product.price*(100-product.discountPercent)/100),
        qty: item.qty,
        image: product.images[0] ?? "",
        sku: product.sku,
      });
      total += Math.round(product.price*(100-product.discountPercent)/100)*item.qty;
    }

    if (total <= 0) return jsonError("مبلغ سفارش نامعتبر است");
    const subtotal=total,storeSettings=await getStoreSettings(),shippingFee=numericSetting(storeSettings["orders.shippingFee"]);total=subtotal+shippingFee;

    const customer=parsed.data.customer,publicId=newPublicOrderId(),amountRial=total*10,mode=gatewayMode();
    const gateway=mode==="zarinpal"?await requestZarinpalPayment({amountRial,callbackUrl:`${appBaseUrl(request)}/pay/callback`,description:`سفارش ${publicId} — نیروانا ۳دی`,email:customer.email,mobile:customer.phone}):null;
    const authority=gateway?.authority??createDemoAuthority();
    await db.transaction(async tx=>{
      const[created]=await tx.insert(orders).values({publicId,userId:user?.id??null,status:"pending",paymentStatus:"pending",subtotalToman:subtotal,shippingToman:shippingFee,totalToman:total,customerName:sanitizeText(customer.name,80),customerEmail:customer.email,customerPhone:customer.phone,province:sanitizeText(customer.province,60),city:sanitizeText(customer.city,60),addressLine:sanitizeText(customer.address,240),postalCode:customer.postalCode||"",note:sanitizeText(customer.note??"",400)}).returning({id:orders.id});
      await tx.insert(orderItems).values(lines.map(line=>({...line,orderId:created.id})));
      await tx.insert(payments).values({orderId:created.id,provider:mode,authority,status:"pending",amountToman:total,amountRial});
      if(user)await tx.insert(addresses).values({userId:user.id,fullName:sanitizeText(customer.name,80),phone:customer.phone,province:sanitizeText(customer.province,60),city:sanitizeText(customer.city,60),line:sanitizeText(customer.address,240),postalCode:customer.postalCode||"",isDefault:true});
    });
    if(gateway)return jsonOk({redirectUrl:gateway.startUrl,publicId});
    const token=signDemoAuthority(authority);return jsonOk({redirectUrl:`/pay/demo?a=${encodeURIComponent(authority)}&t=${token}`,publicId});
  } catch (err) {
    if (err instanceof PaymentConfigurationError) {
      console.error("[checkout] payment configuration", err.message);
      return jsonError("درگاه پرداخت برای پذیرش سفارش واقعی پیکربندی نشده است", 503);
    }
    console.error("[checkout]", err);
    return jsonError("ثبت سفارش انجام نشد", 500);
  }
}
