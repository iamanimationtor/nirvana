import { cancelDemoPayment, finalizePayment, StateConflictError } from "@/lib/order-state";
import { checkDemoSignature } from "@/lib/payment";
import { limitedResponse, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, clientIp, jsonError, jsonOk } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";
const schema = z.object({ authority:z.string().min(10).max(80), token:z.string().min(32).max(128), action:z.enum(["pay","cancel"]) });

export async function POST(request:Request){
  if(!assertSameOrigin(request))return jsonError("درخواست نامعتبر است",403);
  const limited=rateLimit(`pay-demo:${clientIp(request)}`,12,10*60*1000);if(!limited.ok)return limitedResponse(limited.retryAfterMs);
  const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return jsonError("درخواست نامعتبر است");
  const{authority,token,action}=parsed.data;if(!checkDemoSignature(authority,token))return jsonError("امضای تراکنش نامعتبر است",403);
  try{
    if(action==="cancel"){const result=await cancelDemoPayment(authority);return jsonOk({paid:false,publicId:result.publicId})}
    const result=await finalizePayment({authority,refId:`DEMO-${authority.slice(-10)}`,cardPan:"6037-****-****-1234",expectedProvider:"demo",consumeDemoToken:true});
    return jsonOk({paid:true,publicId:result.publicId,refId:result.refId,total:result.total});
  }catch(error){
    if(error instanceof StateConflictError)return jsonError(error.message,error.code==="not_found"?404:409);
    console.error("[payment/demo]",error);return jsonError("پرداخت آزمایشی انجام نشد",500);
  }
}
