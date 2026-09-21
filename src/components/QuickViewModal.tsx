"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  IconCart,
  IconCheck,
  IconClock,
  IconClose,
  IconHeart,
  IconMinus,
  IconPlus,
} from "./Icons";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/constants";
import { discountOf, faNumber, formatPrice } from "@/lib/format";
import { useStore } from "@/store/store";

export default function QuickViewModal() {
  const { quickView, setQuickView, add, setCartOpen, isWished, toggleWish } =
    useStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [variant, setVariant] = useState(0);
  const [qty, setQtyState] = useState(1);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgIdx(0);
    setVariant(0);
    setQtyState(1);
  }, [quickView?.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickView(null);
    };
    if (quickView) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickView, setQuickView]);

  const p = quickView;

  return (
    <AnimatePresence>
      {p && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-3 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-pine/65 backdrop-blur-xl"
            onClick={() => setQuickView(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border border-linec bg-paper shadow-deep md:grid md:grid-cols-2"
          >
            {/* gallery */}
            <div className="relative">
              <div
                ref={imgRef}
                data-cursor="مشاهده"
                className="sheen group relative aspect-square overflow-hidden bg-tint md:aspect-auto md:min-h-[520px]"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imgIdx}
                    src={p.images[imgIdx]}
                    alt={p.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                {discountOf(p) > 0 && (
                  <span className="absolute start-4 top-4 rounded-full bg-gold px-3 py-1.5 text-xs font-extrabold text-pine shadow-soft">
                    {faNumber(discountOf(p))}٪ تخفیف
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {p.images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setImgIdx(i)}
                    aria-label={`تصویر ${i + 1}`}
                    className={
                      "h-14 w-14 overflow-hidden rounded-xl border-2 transition-all duration-300 " +
                      (i === imgIdx
                        ? "border-neon shadow-[0_0_16px_rgba(163,245,90,.5)]"
                        : "border-white/40 opacity-70 hover:opacity-100")
                    }
                  >
                    <Image
                      src={src}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* info */}
            <div className="flex flex-col gap-4 p-6 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-latin text-[10px] font-medium text-gold">
                    {p.nameEn}
                  </span>
                  <h2 className="mt-1 text-xl font-extrabold leading-8 md:text-2xl">
                    {p.name}
                  </h2>
                  <span className="mt-1 inline-block text-xs font-bold text-inksoft">
                    دسته: {p.categoryName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.06 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWish(p)}
                    aria-label="علاقه‌مندی"
                    className={
                      "glass glass-hover grid h-10 w-10 place-items-center rounded-full " +
                      (isWished(p.id) ? "text-red-500" : "text-ink")
                    }
                  >
                    <IconHeart className="h-5 w-5" filled={isWished(p.id)} />
                  </motion.button>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuickView(null)}
                    aria-label="بستن"
                    className="glass glass-hover grid h-10 w-10 place-items-center rounded-full text-ink"
                  >
                    <IconClose className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-2xl font-extrabold text-forest dark:text-neon">
                  {formatPrice(p.price)}
                </span>
                {p.oldPrice && (
                  <span className="pb-1 text-sm text-inksoft line-through">
                    {formatPrice(p.oldPrice)}
                  </span>
                )}
              </div>

              <p className="text-sm leading-7 text-inksoft">
                {p.shortDesc}
              </p>

              {p.variants.length > 0 && (
                <div>
                  <span className="mb-2 block text-xs font-extrabold">
                    رنگ / واریانت
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map((v, i) => (
                      <button
                        key={v}
                        onClick={() => setVariant(i)}
                        className={
                          "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-300 " +
                          (i === variant
                            ? "border-forest bg-forest text-ivory shadow-soft dark:border-neon dark:bg-neon dark:text-pine"
                            : "border-linec text-inksoft hover:border-olive hover:text-ink")
                        }
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ul className="grid gap-1.5">
                {p.features.slice(0, 3).map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-inksoft"
                  >
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-olive/15 text-olivedeep dark:bg-neon/15 dark:text-neon">
                      <IconCheck className="h-2.5 w-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 rounded-2xl border border-linec bg-canvas/60 px-4 py-3 text-xs">
                <span className="flex items-center gap-1.5 text-inksoft">
                  <IconClock className="h-4 w-4" />
                  آماده‌سازی: {p.prepTime}
                </span>
                <span
                  className={
                    "flex items-center gap-1.5 font-extrabold " +
                    (p.stock > 0 ? "text-olive dark:text-neon" : "text-red-500")
                  }
                >
                  <span
                    className={
                      "h-2 w-2 rounded-full " +
                      (p.stock > 0 ? "bg-olive dark:bg-neon" : "bg-red-500")
                    }
                  />
                  {p.stock > 0
                    ? `موجود — ${faNumber(p.stock)} عدد`
                    : "موقتاً ناموجود"}
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-linec bg-canvas/60 px-2 py-1.5">
                    <button
                      onClick={() => setQtyState((v) => Math.max(1, v - 1))}
                      aria-label="کاهش تعداد"
                      className="grid h-7 w-7 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                    >
                      <IconMinus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-extrabold">
                      {faNumber(qty)}
                    </span>
                    <button
                      onClick={() => setQtyState((v) => Math.min(MAX_CART_ITEM_QUANTITY, v + 1))}
                      aria-label="افزایش تعداد"
                      className="grid h-7 w-7 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                    >
                      <IconPlus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-inksoft">تعداد</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    disabled={p.stock === 0}
                    onClick={() => add(p, qty, imgRef.current)}
                    className="btn btn-primary px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconCart className="h-4 w-4" />
                    افزودن به سبد
                  </button>
                  <button
                    disabled={p.stock === 0}
                    onClick={() => {
                      add(p, qty);
                      setQuickView(null);
                      setCartOpen(true);
                    }}
                    className="btn btn-gold px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    خرید سریع
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
