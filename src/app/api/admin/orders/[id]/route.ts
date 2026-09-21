import { requireAdminApi } from "@/lib/admin-auth";
import { orderUpdateSchema } from "@/lib/admin-validation";
import { StateConflictError, updateOrderByAdmin } from "@/lib/order-state";
import { assertSameOrigin, clientIp, jsonError, jsonOk } from "@/lib/security";
import { zodMessage } from "@/lib/validation";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!assertSameOrigin(request))return jsonError("درخواست نامعتبر است",403);const auth=await requireAdminApi("orders.edit");if(auth.response)return auth.response;
 const id=(await params).id,parsed=orderUpdateSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return jsonError(zodMessage(parsed.error));
 try{const result=await updateOrderByAdmin({publicId:id,adminId:auth.admin.id,...parsed.data,ip:clientIp(request)});return jsonOk({order:result})}
 catch(error){if(error instanceof StateConflictError)return jsonError(error.message,error.code==="not_found"?404:409);console.error("[order/update]",error);return jsonError("به‌روزرسانی سفارش انجام نشد",500)}
}
