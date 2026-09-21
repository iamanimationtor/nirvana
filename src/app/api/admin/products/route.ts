import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { adminActivityLogs, inventoryTransactions, products } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";
import { productAdminSchema } from "@/lib/admin-validation";
import { assertSameOrigin, clientIp, hashIp, jsonError, jsonOk } from "@/lib/security";
import { zodMessage } from "@/lib/validation";
export async function POST(request:Request){if(!assertSameOrigin(request))return jsonError("درخواست نامعتبر است",403);const auth=await requireAdminApi("products.create");if(auth.response)return auth.response;try{const parsed=productAdminSchema.safeParse(await request.json());if(!parsed.success)return jsonError(zodMessage(parsed.error));const d=parsed.data;const [created]=await db.transaction(async tx=>{const rows=await tx.insert(products).values({...d,oldPrice:d.oldPrice||null}).returning();await tx.insert(inventoryTransactions).values({productId:rows[0].id,type:"initial",quantity:d.stock,before:0,after:d.stock,reason:"موجودی اولیه",idempotencyKey:`product:${rows[0].id}:initial`,adminId:auth.admin.id});await tx.insert(adminActivityLogs).values({adminId:auth.admin.id,action:"product.created",targetType:"product",targetId:String(rows[0].id),metadata:{sku:rows[0].sku},ipHash:hashIp(clientIp(request))});return rows;});revalidatePath("/", "layout");return jsonOk({product:created});}catch(error){console.error("[admin/products/create]",error);if(String(error).includes("unique"))return jsonError("شناسه کالا یا نشانی تکراری است",409);return jsonError("ذخیره محصول انجام نشد",500)}}
