"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconArrowLeft, IconClose, IconSearch } from "./Icons";
import { formatPrice } from "@/lib/format";
import { fallbackProducts } from "@/lib/seed-data";
import type { Product } from "@/lib/types";
import { useStore } from "@/store/store";

const SUGGESTIONS = ["فیگور", "چراغ", "دکور", "گیم", "اکسسوری", "گلدان"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!searchOpen) return;
    setQ("");
    setReady(false);
    let live = true;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!live) return;
        setProducts(Array.isArray(d) ? d : fallbackProducts());
        setReady(true);
      })
      .catch(() => {
        if (!live) return;
        setProducts(fallbackProducts());
        setReady(true);
      });
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return products.slice(0, 5);
    return products.filter((p) =>
      [p.name, p.nameEn, p.shortDesc, p.categoryName].join(" ").includes(query)
    );
  }, [q, products]);

  const go = (p: Product) => {
    setSearchOpen(false);
    router.push(`/product/${p.slug}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[160]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-pine/70 backdrop-blur-xl dark:bg-pine/80"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative flex h-full items-start justify-center overflow-y-auto px-4 pt-[12vh]">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl"
            >
              <div className="glass rounded-[30px] p-5 md:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-latin text-[10px] font-medium text-inksoft">
                    SEARCH / جستجو
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.06, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(false)}
                    aria-label="بستن"
                    className="glass glass-hover grid h-10 w-10 place-items-center rounded-full text-ink"
                  >
                    <IconClose className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="flex items-center gap-3 border-b-2 border-linec pb-4 focus-within:border-olive">
                  <IconSearch className="h-7 w-7 shrink-0 text-inksoft" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && results[0]) go(results[0]);
                    }}
                    placeholder="دنبال چی می‌گردی؟"
                    className="w-full bg-transparent text-xl font-extrabold text-ink outline-none placeholder:text-inksoft/60 md:text-3xl"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-300 " +
                        (q === s
                          ? "border-olive bg-olive text-ivory"
                          : "border-linec text-inksoft hover:border-olive hover:text-ink")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex min-h-[220px] flex-col gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {ready &&
                      results.map((p, i) => (
                        <motion.button
                          key={p.slug}
                          layout
                          initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                          transition={{
                            duration: 0.35,
                            delay: i * 0.04,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          onClick={() => go(p)}
                          className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 text-start transition-all duration-300 hover:border-linec hover:bg-paper/70"
                        >
                          <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-extrabold">
                              {p.name}
                            </span>
                            <span className="text-xs text-inksoft">
                              {p.categoryName} · {formatPrice(p.price)}
                            </span>
                          </span>
                          <IconArrowLeft className="h-4 w-4 text-inksoft opacity-0 transition-all duration-300 group-hover:opacity-100" />
                        </motion.button>
                      ))}
                  </AnimatePresence>
                  {ready && results.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center"
                    >
                      <span className="text-sm font-extrabold text-inksoft">
                        نتیجه‌ای برای «{q}» پیدا نشد
                      </span>
                      <span className="text-xs text-inksoft/70">
                        پیشنهاد می‌کنیم کلمات دیگری امتحان کنید
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
