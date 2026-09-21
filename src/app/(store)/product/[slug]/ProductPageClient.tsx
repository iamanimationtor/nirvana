"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  IconBox,
  IconCart,
  IconCheck,
  IconClock,
  IconClose,
  IconHeart,
  IconMinus,
  IconPlus,
  IconShield,
  IconSpark,
  IconTruck,
  IconZoom,
} from "@/components/Icons";
import Magnetic from "@/components/Magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/constants";
import { discountOf, faNumber, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/store";

export default function ProductPageClient({
  product: p,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { add, setCartOpen, isWished, toggleWish } = useStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [fs, setFs] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  /* 3d tilt */
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });

  useEffect(() => {
    setImgIdx(0);
    setQty(1);
  }, [p.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFs(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * 7);
    ry.set(px * 7);
  };

  const disc = discountOf(p);
  const out = p.stock === 0;

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container-x">
        {/* breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold text-inksoft">
          <Link href="/" className="transition hover:text-ink">خانه</Link>
          <span className="text-gold">/</span>
          <Link href="/shop" className="transition hover:text-ink">فروشگاه</Link>
          <span className="text-gold">/</span>
          <Link
            href={`/shop?cat=${p.categorySlug}`}
            className="transition hover:text-ink"
          >
            {p.categoryName}
          </Link>
          <span className="text-gold">/</span>
          <span className="text-ink">{p.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── gallery ── */}
          <div>
            <div style={{ perspective: 1100 }}>
              <motion.div
                style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
                onMouseMove={onMove}
                onMouseLeave={() => {
                  rx.set(0);
                  ry.set(0);
                }}
                className="relative"
              >
                <div
                  ref={mainRef}
                  data-cursor="کشف کن"
                  className="sheen group relative aspect-square overflow-hidden rounded-[32px] border border-linec bg-tint shadow-soft"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={imgIdx}
                      src={p.images[imgIdx]}
                      alt={p.name}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  </AnimatePresence>
                  {disc > 0 && (
                    <span className="absolute start-5 top-5 rounded-full bg-gold px-3.5 py-2 text-xs font-extrabold text-pine shadow-soft">
                      {faNumber(disc)}٪ تخفیف
                    </span>
                  )}
                  <button
                    onClick={() => setFs(true)}
                    aria-label="تمام‌صفحه"
                    className="glass glass-hover absolute bottom-5 end-5 grid h-11 w-11 place-items-center rounded-full text-ink"
                  >
                    <IconZoom className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* thumbs */}
            <div className="mt-4 flex gap-3">
              {p.images.map((src, i) => (
                <motion.button
                  key={src + i}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setImgIdx(i)}
                  aria-label={`تصویر ${i + 1}`}
                  className={
                    "relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all duration-300 " +
                    (i === imgIdx
                      ? "border-neon shadow-[0_0_18px_rgba(163,245,90,0.45)]"
                      : "border-linec opacity-60 hover:opacity-100")
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── info ── */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="font-latin text-[10px] font-medium text-gold">
                {p.nameEn}
              </span>
              <h1 className="mt-2 text-3xl font-extrabold leading-[1.35] md:text-4xl">
                {p.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-extrabold text-forest dark:text-neon">
                  {formatPrice(p.price)}
                </span>
                {p.oldPrice && (
                  <span className="text-base text-inksoft line-through">
                    {formatPrice(p.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm leading-8 text-inksoft">{p.description}</p>

            {/* features */}
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {p.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 rounded-2xl border border-linec bg-paper/60 px-3.5 py-3 text-xs font-bold leading-6"
                >
                  <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-olive/15 text-olivedeep dark:bg-neon/15 dark:text-neon">
                    <IconCheck className="h-2.5 w-2.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* meta */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: IconClock,
                  label: "آماده‌سازی",
                  value: p.prepTime,
                },
                {
                  icon: IconBox,
                  label: "موجودی",
                  value: out
                    ? "موقتاً ناموجود"
                    : `${faNumber(p.stock)} عدد`,
                  ok: !out,
                },
                { icon: IconSpark, label: "متریال", value: p.material },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-linec bg-paper/60 px-2 py-4 text-center"
                >
                  <m.icon className="h-5 w-5 text-gold" />
                  <span className="text-[10px] font-bold text-inksoft">
                    {m.label}
                  </span>
                  <span
                    className={
                      "text-xs font-extrabold " +
                      (m.ok === false ? "text-red-500" : "")
                    }
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* qty + actions */}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-linec bg-paper/60 px-2 py-2">
                <button
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  aria-label="کاهش تعداد"
                  className="grid h-8 w-8 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                >
                  <IconMinus className="h-4 w-4" />
                </button>
                <span className="min-w-7 text-center text-sm font-extrabold">
                  {faNumber(qty)}
                </span>
                <button
                  onClick={() => setQty((v) => Math.min(MAX_CART_ITEM_QUANTITY, v + 1))}
                  aria-label="افزایش تعداد"
                  className="grid h-8 w-8 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>

              <Magnetic className="flex-1" strength={0.14}>
                <button
                  disabled={out}
                  onClick={() => add(p, qty, mainRef.current)}
                  className="btn btn-primary w-full px-8 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <IconCart className="h-4.5 w-4.5" />
                  {out ? "به‌زودی در دسترس" : "افزودن به سبد"}
                </button>
              </Magnetic>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                disabled={out}
                onClick={() => {
                  add(p, qty);
                  setCartOpen(true);
                }}
                className="btn btn-gold px-7 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-45"
              >
                خرید سریع
              </button>
              <button
                onClick={() => toggleWish(p)}
                className={
                  "flex items-center gap-2 text-xs font-extrabold transition-colors " +
                  (isWished(p.id) ? "text-red-500" : "text-inksoft hover:text-ink")
                }
              >
                <IconHeart className="h-4.5 w-4.5" filled={isWished(p.id)} />
                {isWished(p.id) ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
              </button>
            </div>

            {/* trust */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-linec pt-6 text-center">
              {[
                { icon: IconShield, t: "گواهی اصالت" },
                { icon: IconTruck, t: "ارسال رایگان" },
                { icon: IconSpark, t: "طراحی اختصاصی" },
              ].map((t) => (
                <div key={t.t} className="flex flex-col items-center gap-2">
                  <span className="glass grid h-11 w-11 place-items-center rounded-full text-forest dark:text-neon">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-extrabold text-inksoft">
                    {t.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mt-24">
            <Reveal>
              <span className="font-latin text-[10px] font-medium text-gold">
                YOU MAY ALSO LIKE
              </span>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                محصولات مشابه
              </h2>
            </Reveal>
            <Stagger
              gap={0.08}
              className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
            >
              {related.map((r) => (
                <StaggerItem key={r.slug}>
                  <ProductCard product={r} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>

      {/* fullscreen viewer */}
      <AnimatePresence>
        {fs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-pine/95 p-4 backdrop-blur-2xl"
            onClick={() => setFs(false)}
          >
            <motion.img
              key={imgIdx}
              src={p.images[imgIdx]}
              alt={p.name}
              initial={{ scale: 0.9, filter: "blur(12px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.96, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-full rounded-[24px] object-contain shadow-deep"
            />
            <motion.button
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFs(false)}
              aria-label="بستن"
              className="glass absolute end-5 top-5 grid h-12 w-12 place-items-center rounded-full text-ivory"
            >
              <IconClose className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
