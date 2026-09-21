import sharp from "sharp";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveProductMedia } from "@/lib/product-media";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/security";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedFormats = new Set(["jpeg", "png", "webp"]);

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!auth.admin.permissions.includes("products.edit") && !auth.admin.permissions.includes("products.create")) return jsonError("اجازه آپلود تصویر را ندارید", 403);

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return jsonError("فایل ارسال نشده است");
  if (file.size < 16 || file.size > 5 * 1024 * 1024) return jsonError("حجم تصویر باید بین ۱۶ بایت و ۵ مگابایت باشد", 413);
  if (!allowedTypes.has(file.type)) return jsonError("فقط JPEG، PNG و WebP مجاز است", 415);

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const decoder = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 });
    const metadata = await decoder.metadata();
    if (!metadata.format || !allowedFormats.has(metadata.format) || !metadata.width || !metadata.height || metadata.width > 8000 || metadata.height > 8000) {
      return jsonError("ساختار یا ابعاد تصویر معتبر نیست", 415);
    }

    const output = await decoder
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    return jsonOk({ url: await saveProductMedia(output) });
  } catch (error) {
    console.error("[upload] invalid image or storage failure", error);
    return jsonError("فایل تصویر قابل پردازش یا ذخیره‌سازی نیست", 415);
  }
}
