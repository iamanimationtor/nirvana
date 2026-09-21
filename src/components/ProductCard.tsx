"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { IconCart, IconHeart, IconZoom } from "./Icons";
import { discountOf, faNumber, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/store";

export default function ProductCard({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const { setQuickView, add, isWished, toggleWish } = useStore();
  const imgRef = useRef<HTMLDivElement>(null);
  const disc = discountOf(product);
  const out = product.stock === 0;

  return (
    <article
      className={
        "pcard group relative flex flex-col overflow-hidden rounded-[20px] border border-linec bg-paper transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-deep " +
        (large ? "" : "")
      }
    >
      {/* image */}
      <button
        onClick={() => setQuickView(product)}
        className={
          "sheen relative block w-full overflow-hidden bg-tint text-start " +
          (large ? "aspect-square md:aspect-[16/11]" : "aspect-square")
        }
        aria-label={`مشاهده سریع ${product.name}`}
      >
        <div ref={imgRef} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={
              large
                ? "(max-width: 768px) 100vw, 55vw"
                : "(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </div>

        {/* top badges */}
        <span className="glass absolute start-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-ink">
          {product.categoryName}
        </span>

        {disc > 0 && (
          <span className="absolute bottom-2.5 start-2.5 rounded-full bg-gold px-2 py-1 text-[10px] font-extrabold text-pine shadow-soft">
            {faNumber(disc)}٪-
          </span>
        )}
        {out && (
          <span className="absolute inset-0 grid place-items-center bg-pine/55 backdrop-blur-[2px]">
            <span className="rounded-full border border-ivory/40 px-3 py-1.5 text-[11px] font-extrabold text-ivory">
              موقتاً ناموجود
            </span>
          </span>
        )}

        {/* hover quick-view hint */}
        <span className="glass absolute bottom-2.5 end-2.5 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <IconZoom className="h-3 w-3" />
          مشاهده سریع
        </span>
      </button>

      {/* wishlist */}
      <button
        onClick={() => toggleWish(product)}
        aria-label="افزودن به علاقه‌مندی‌ها"
        className={
          "glass glass-hover absolute end-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105 " +
          (isWished(product.id) ? "text-red-500" : "text-ink")
        }
      >
        <IconHeart className="h-4 w-4" filled={isWished(product.id)} />
      </button>

      {/* body */}
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="font-latin text-[9px] font-medium text-gold">
          {product.nameEn}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="text-[13px] font-extrabold leading-5 transition-colors hover:text-forest hover:underline underline-offset-4 dark:hover:text-neon"
        >
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-extrabold text-forest dark:text-neon">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-inksoft line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <button
          disabled={out}
          onClick={() => add(product, 1, imgRef.current)}
          className="btn btn-primary mt-2 w-full py-2.5 text-xs transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <IconCart className="h-3.5 w-3.5" />
          {out ? "به‌زودی در دسترس" : "افزودن به سبد"}
        </button>
      </div>
    </article>
  );
}
