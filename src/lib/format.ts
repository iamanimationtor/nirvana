import type { Product } from "./types";

const FA_DIGITS = "۰۱۲۴۵۶۸۹";

/** Convert any latin digits in a value to Persian digits. */
export function faNum(value: number | string): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format a price in Persian (tooman). e.g. ۶۸٬۰۰ تومان */
export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;
}

/** Compact Persian number (without word). */
export function faNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function discountOf(p: Product): number {
  if (!p.oldPrice || p.oldPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.oldPrice) * 100);
}
