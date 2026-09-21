"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import Magnetic from "./Magnetic";
import { IconArrowLeft, IconPlus } from "./Icons";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/store";

const TITLE_LINES: { words: string[]; gold?: boolean }[] = [
  { words: ["هنر", "سه‌بعدی،"] },
  { words: ["برای", "دنیای", "واقعی"], gold: true },
];

function LeafBlob({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      <path
        d="M100 195C42 160 20 110 38 55 88 28 148 38 172 88c18 44-14 92-72 107Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M100 195C88 145 100 95 145 60"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M92 150c-14-4-26-12-34-24M98 112c-10-2-20-8-27-16M110 78c-6-4-14-7-22-8"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Hero({ product }: { product?: Product }) {
  const { add } = useStore();
  const smallRef = useRef<HTMLDivElement>(null);

  /* mouse parallax for leaves */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 20 });
  const smy = useSpring(my, { stiffness: 40, damping: 20 });
  const fgX = useTransform(smx, (v) => v * 26);
  const fgY = useTransform(smy, (v) => v * 18);
  const bgX = useTransform(smx, (v) => -v * 12);
  const bgY = useTransform(smy, (v) => -v * 9);

  const onMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * 2);
    my.set((e.clientY / innerHeight - 0.5) * 2);
  };

  return (
    <section
      onMouseMove={onMouseMove}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16"
    >
      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(194,161,91,0.22),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] end-[-8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(163,245,90,0.14),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_55%,rgba(36,43,34,0.06))]"
      />

      {/* dust particles */}
      <div aria-hidden className="dust absolute inset-0">
        {[
          [8, 70, 0], [18, 45, 2], [27, 80, 4], [36, 35, 1], [47, 65, 3],
          [58, 30, 5], [66, 75, 2.5], [74, 40, 0.5], [83, 60, 3.5], [91, 35, 1.5],
          [15, 25, 4.5], [52, 88, 6],
        ].map(([l, t, d], i) => (
          <i
            key={i}
            style={{
              left: `${l}%`,
              top: `${t}%`,
              animationDelay: `${d}s`,
              animationDuration: `${9 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* background leaves (slow parallax) */}
      <motion.div
        aria-hidden
        style={{ x: bgX, y: bgY }}
        className="pointer-events-none absolute inset-0"
      >
        <LeafBlob className="absolute -top-16 end-[-60px] h-64 w-64 rotate-[130deg] text-olive/25 dark:text-olive/40" />
        <LeafBlob className="absolute bottom-[-40px] start-[-70px] h-72 w-72 -rotate-[140deg] scale-x-[-1] text-gold/20 dark:text-gold/30" />
      </motion.div>

      {/* foreground leaves (fast parallax) */}
      <motion.div
        aria-hidden
        style={{ x: fgX, y: fgY }}
        className="pointer-events-none absolute inset-0 z-[1]"
      >
        <LeafBlob className="animate-floaty-soft absolute top-24 start-[38%] hidden h-32 w-32 rotate-[160deg] text-forest/20 lg:block dark:text-neon/20" />
        <LeafBlob className="animate-floaty absolute bottom-24 end-[8%] h-28 w-28 rotate-[200deg] scale-x-[-1] text-olive/30 dark:text-neon/25" />
      </motion.div>

      <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* ── text column ── */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold text-ink"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
            </span>
            گالری و کارگاه چاپ سه‌بعدی — تهران
          </motion.span>

          <h1 className="mt-6 text-[2.9rem] font-extrabold leading-[1.12] tracking-tight md:text-6xl xl:text-[4.6rem]">
            {TITLE_LINES.map((line, li) => (
              <span key={li} className="block overflow-hidden pb-1">
                {line.words.map((w, wi) => (
                  <span key={wi} className="inline-block overflow-hidden align-bottom">
                    <motion.span
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{
                        delay: 0.35 + (li * 2 + wi) * 0.09,
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={
                        "inline-block pr-3 " +
                        (li === 1 && w === "واقعی" ? "text-gold" : "")
                      }
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-base leading-8 text-inksoft md:text-lg"
          >
            اکسسوری، دکور، فیگور و آثار خاص
            <br />
            با طراحی متفاوت و چاپ سه‌بعدی
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link
                href="/shop"
                className="btn btn-primary group px-8 py-4 text-sm"
              >
                مشاهده محصولات
                <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href="#collection"
                className="btn btn-glass glass glass-hover px-8 py-4 text-sm"
              >
                کشف کالکشن
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-inksoft"
          >
            <span>چاپ با دقت ۰٫۱۲ میلی‌متر</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span>طراحی اختصاصی</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span>ارسال از تهران</span>
          </motion.div>
        </div>

        {/* ── product column ── */}
        <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
          {/* rotating dashed ring motif */}
          <div
            aria-hidden
            className="animate-spin-slow absolute -top-8 end-6 hidden h-40 w-40 rounded-full border border-dashed border-gold/40 md:block"
          />
          <div
            aria-hidden
            className="glass absolute -bottom-6 start-4 hidden h-24 w-24 rounded-full opacity-60 md:block"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                data-cursor="کشف کن"
                className="sheen relative aspect-[4/5] overflow-hidden rounded-[40px] shadow-deep"
              >
                <Image
                  src="/images/hero.jpg"
                  alt="اثر سه‌بعدی نیروانا"
                  priority
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[40px] ring-1 ring-inset ring-white/30"
                />
              </div>

              {/* floating glass badges */}
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="glass absolute -top-4 end-6 hidden rounded-2xl px-4 py-2.5 font-latin text-[10px] font-bold text-ink sm:block"
              >
                [ 3D PRINTED ]
              </motion.span>
              <motion.span
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="glass absolute bottom-16 -start-4 hidden rounded-2xl px-4 py-2.5 font-latin text-[10px] font-bold text-ink sm:block"
              >
                [ MADE WITH ART ]
              </motion.span>
            </motion.div>

            {/* shadow under product */}
            <div
              aria-hidden
              className="absolute -bottom-8 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-full bg-pine/25 blur-2xl dark:bg-black/60"
            />

            {/* floating info card */}
            {product && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-10 end-[-8px]"
              >
                <div
                  className="glass flex w-64 items-center gap-3 rounded-3xl p-3 shadow-deep"
                  style={{ animation: "floaty-soft 9s ease-in-out infinite", animationDelay: "1s" }}
                >
                <div
                  ref={smallRef}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold">{product.name}</p>
                  <p className="mt-0.5 text-xs font-bold text-forest dark:text-neon">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => add(product, 1, smallRef.current)}
                  aria-label="افزودن به سبد"
                  className="btn btn-primary h-9 w-9 shrink-0 !rounded-full !p-0"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* scroll hint */}
      <motion.a
        href="#categories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-inksoft md:flex"
        aria-label="اسکرول"
      >
        <span className="font-latin text-[9px]">SCROLL</span>
        <span className="relative h-10 w-px overflow-hidden bg-linec">
          <motion.span
            animate={{ y: [-24, 24] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-5 bg-gold"
          />
        </span>
      </motion.a>
    </section>
  );
}
