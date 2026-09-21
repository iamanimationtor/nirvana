"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import ProductCard from "@/components/ProductCard";
import { Stagger, StaggerItem } from "@/components/Reveal";
import { faNumber } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export default function ShopClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const cat = params.get("cat") ?? "";
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const list = cat ? products.filter((p) => p.categorySlug === cat) : products;
    return [...list].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
  }, [products, cat]);

  const select = (slug: string | null) => {
    startTransition(() => {
      if (slug) router.replace(`/shop?cat=${slug}`, { scroll: false });
      else router.replace("/shop", { scroll: false });
    });
  };

  const chip = (active: boolean) =>
    "shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition-all duration-300 " +
    (active
      ? "border-forest bg-forest text-ivory shadow-soft dark:border-neon dark:bg-neon dark:text-pine"
      : "border-linec bg-paper/60 text-inksoft hover:border-olive hover:text-ink");

  return (
    <div className="container-x">
      {/* category chips */}
      <div className="no-scrollbar -mx-4 mb-10 flex gap-2.5 overflow-x-auto px-4 pb-1">
        <button className={chip(!cat)} onClick={() => select(null)}>
          همه
          <span className="ms-1.5 text-[10px] opacity-60">
            {faNumber(products.length)}
          </span>
        </button>
        {categories.map((c) => {
          const n = products.filter((p) => p.categorySlug === c.slug).length;
          return (
            <button
              key={c.slug}
              className={chip(cat === c.slug)}
              onClick={() => select(c.slug)}
            >
              {c.name}
              <span className="ms-1.5 text-[10px] opacity-60">{faNumber(n)}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-6 text-xs font-bold text-inksoft">
        {faNumber(filtered.length)} محصول
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={cat || "all"}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-lg font-extrabold">هنوز محصولی در این دسته نیست</p>
              <p className="text-sm text-inksoft">به‌زودی پر از اثر می‌شود.</p>
            </div>
          ) : (
            <Stagger
              gap={0.06}
              className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {filtered.map((p) => (
                <StaggerItem key={p.slug}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
