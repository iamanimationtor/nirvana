"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { CATEGORY_ICONS, IconArrowLeft } from "./Icons";
import { Reveal } from "./Reveal";
import type { Category } from "@/lib/types";

export default function CategorySection({
  categories,
}: {
  categories: Category[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = () => {
    const el = railRef.current;
    if (!el) return;
    // In RTL, scrollLeft can be 0 (start/rightmost), and negative when scrolled to left,
    // or standard depending on browser implementation.
    // Using Math.abs for cross-browser safety:
    const scrollPos = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollRight(scrollPos > 10);
    setCanScrollLeft(scrollPos < maxScroll - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollByDirection = (direction: "right" | "left") => {
    const el = railRef.current;
    if (!el) return;
    const distance = 280;
    // In RTL Persian: "right" scrolls back towards start, "left" scrolls forward into next items
    const delta = direction === "left" ? -distance : distance;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section id="categories" className="relative py-24">
      <div className="container-x">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="font-latin text-[10px] font-medium text-gold">
              CATEGORIES
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              برای چه چیزی می‌گردی؟
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex items-center gap-4">
              {/* Left and Right navigation buttons */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => scrollByDirection("right")}
                  aria-label="دسته‌بندی‌های قبلی (راست)"
                  title="قبلی"
                  className="glass glass-hover grid h-11 w-11 place-items-center rounded-full text-ink transition-opacity"
                >
                  {/* Arrow pointing right in RTL represents going back */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => scrollByDirection("left")}
                  aria-label="دسته‌بندی‌های بعدی (چپ)"
                  title="بعدی"
                  className="glass glass-hover grid h-11 w-11 place-items-center rounded-full text-ink transition-opacity"
                >
                  {/* Arrow pointing left in RTL represents going forward */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
                </motion.button>
              </div>

              <span className="h-6 w-px bg-linec" />

              <Link
                href="/shop"
                className="group flex items-center gap-2 text-sm font-extrabold text-inksoft transition-colors hover:text-ink"
              >
                همه محصولات
                <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* horizontal glass rail */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent"
          />
          <div
            ref={railRef}
            className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-6 md:gap-6"
          >
            {categories.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.icon] ?? CATEGORY_ICONS.spark;
              return (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 46, rotate: i % 2 === 0 ? -5 : 5 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="snap-center"
                >
                  <Link
                    href={`/shop?cat=${c.slug}`}
                    className="group flex w-36 shrink-0 flex-col items-center gap-4 text-center"
                  >
                    <span className="relative">
                      {/* neon aura */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-neon/0 blur-xl transition-all duration-500 group-hover:bg-neon/25"
                      />
                      <motion.span
                        whileHover={{ rotate: 7, scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="glass glass-hover relative grid h-24 w-24 place-items-center rounded-full"
                      >
                        <Icon className="h-9 w-9 text-forest transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(163,245,90,0.7)] dark:text-neon" />
                        <span className="absolute bottom-2 h-1.5 w-5 rounded-full bg-gold/70 transition-all duration-500 group-hover:w-8 group-hover:bg-neon" />
                      </motion.span>
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold transition-colors group-hover:text-forest dark:group-hover:text-neon">
                        {c.name}
                      </span>
                      <span className="mt-1 block max-w-[10rem] text-[11px] leading-5 text-inksoft">
                        {c.blurb}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
