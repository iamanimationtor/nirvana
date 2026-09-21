import { z } from "zod";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/constants";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("ایمیل معتبر نیست")
  .max(120);

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور حداقل ۸ کاراکتر باشد")
  .max(72, "رمز عبور بیش از حد طولانی است")
  .regex(/[A-Za-zآ-ی]/, "رمز عبور باید شامل حرف باشد")
  .regex(/\d/, "رمز عبور باید شامل عدد باشد");

/** Stronger policy for privileged administrative accounts. */
export const adminPasswordSchema = passwordSchema.min(12, "رمز عبور مدیر باید حداقل ۱۲ کاراکتر باشد");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره موبایل را با ۰۹ وارد کنید");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "نام خیلی کوتاه است").max(80),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "رمز عبور را وارد کنید").max(72),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema.optional().or(z.literal("")),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: adminPasswordSchema,
});

const checkoutItemSchema = z.object({
  id: z.number().int().positive(),
  qty: z.number().int().min(1).max(MAX_CART_ITEM_QUANTITY),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "سبد خرید خالی است").max(30, "تعداد اقلام سفارش زیاد است").superRefine((items, context) => {
    const seen = new Set<number>();
    for (const [index, item] of items.entries()) {
      if (seen.has(item.id)) context.addIssue({ code: "custom", path: [index], message: "هر محصول فقط یک‌بار در سبد سفارش ارسال شود" });
      seen.add(item.id);
    }
  }),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    email: emailSchema,
    phone: phoneSchema,
    province: z.string().trim().min(2).max(60),
    city: z.string().trim().min(2).max(60),
    address: z.string().trim().min(8).max(240),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد")
      .or(z.literal("")),
    note: z.string().trim().max(400).optional().default(""),
  }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(8).max(2000),
});

export const newsletterSchema = z.object({
  email: emailSchema,
});

export function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست";
}
