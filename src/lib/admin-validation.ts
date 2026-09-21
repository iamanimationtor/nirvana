import { z } from "zod";
const slug = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "نشانی فقط شامل حروف انگلیسی، عدد و خط تیره باشد");
export const productAdminSchema = z.object({
  name:z.string().trim().min(2).max(160), nameEn:z.string().trim().max(160).default(""), sku:z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9._-]+$/), slug,
  categoryId:z.coerce.number().int().positive(), price:z.coerce.number().int().min(0).max(2_000_000_000), oldPrice:z.coerce.number().int().min(0).nullable().optional(), discountPercent:z.coerce.number().int().min(0).max(100).default(0),
  stock:z.coerce.number().int().min(0).max(10_000_000), minStock:z.coerce.number().int().min(0).max(1_000_000), status:z.enum(["draft","active","inactive","archived"]), featured:z.boolean().default(false),
  brand:z.string().trim().max(100).default(""), shortDesc:z.string().trim().max(400).default(""), description:z.string().trim().max(20000).default(""), material:z.string().trim().max(120).default(""), prepTime:z.string().trim().max(120).default(""),
  images:z.array(z.string().trim().max(300).regex(/^\/(?:images\/|uploads\/products\/|api\/media\/)/,"آدرس تصویر باید از فضای رسانه امن فروشگاه باشد")).max(12).default([]), tags:z.array(z.string().trim().max(50)).max(30).default([]), features:z.array(z.string().trim().max(200)).max(50).default([]), variants:z.array(z.string().trim().max(100)).max(50).default([]),
  seoTitle:z.string().trim().max(70).default(""), seoDescription:z.string().trim().max(170).default(""), specifications:z.record(z.string(),z.string()).default({}), shipping:z.record(z.string(),z.union([z.string(),z.number(),z.boolean()])).default({}),
});
export const inventoryAdjustmentSchema=z.object({productId:z.number().int().positive(),quantity:z.number().int().min(-1_000_000).max(1_000_000).refine(v=>v!==0),reason:z.string().trim().min(3).max(300)});
export const orderUpdateSchema=z.object({status:z.enum(["pending","confirmed","processing","preparing","shipped","delivered","cancelled","returned","refunded"]).optional(),paymentStatus:z.enum(["unpaid","pending","paid","failed","refunded","partially_refunded"]).optional(),shippingStatus:z.enum(["pending","preparing","shipped","delivered","returned"]).optional(),internalNote:z.string().trim().max(2000).optional()}).refine(v=>Object.keys(v).length>0);
