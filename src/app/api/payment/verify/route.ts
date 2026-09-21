import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { cancelPendingGatewayPayment, finalizePayment, StateConflictError } from "@/lib/order-state";
import { verifyZarinpalPayment } from "@/lib/payment";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import { clientIp, jsonError, jsonOk } from "@/lib/security";
export const dynamic="force-dynamic";

export async function GET(request:Request){
  const limited=rateLimit(`pay-verify:${clientIp(request)}`,20,10*60*1000);if(!limited.ok)return limitedResponse(limited.retryAfterMs);
  const url=new URL(request.url),authority=url.searchParams.get("Authority")??url.searchParams.get("authority")??"",status=url.searchParams.get("Status")??url.searchParams.get("status")??"";
  if(!authority)return jsonError("شناسه تراکنش نامعتبر است");
  try{
    const[pay]=await db.select().from(payments).where(eq(payments.authority,authority)).limit(1);if(!pay)return jsonError("تراکنش پیدا نشد",404);
    const[order]=await db.select().from(orders).where(eq(orders.id,pay.orderId)).limit(1);if(!order)return jsonError("سفارش پیدا نشد",404);
    if(pay.provider!=="zarinpal")return jsonError("این تراکنش باید از صفحه درگاه آزمایشی تأیید شود");
    if(pay.status==="verified")return jsonOk({paid:true,publicId:order.publicId,refId:pay.refId,total:order.totalToman});
    if(pay.status!=="pending"||order.status!=="pending")return jsonError("وضعیت تراکنش اجازه تأیید را نمی‌دهد",409);
    if(status.toUpperCase()!=="OK"){await cancelPendingGatewayPayment(authority);return jsonError("پرداخت توسط درگاه تأیید نشد",400);}
    const verified=await verifyZarinpalPayment({amountRial:pay.amountRial,authority});
    const result=await finalizePayment({authority,refId:verified.refId,cardPan:verified.cardPan,expectedProvider:"zarinpal"});
    return jsonOk({paid:true,publicId:result.publicId,refId:result.refId,total:result.total});
  }catch(error){
    if(error instanceof StateConflictError)return jsonError(error.message,error.code==="not_found"?404:409);
    console.error("[payment/verify]",error);return jsonError("تأیید پرداخت ناموفق بود",400);
  }
}
