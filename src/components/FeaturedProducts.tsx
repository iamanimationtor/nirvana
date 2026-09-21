"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { IconArrowLeft, IconShield, IconSpark, IconTruck } from "./Icons";
import type { Product } from "@/lib/types";

const VALUES = [
  { icon: IconShield, label: "گواهی اصالت اثر" },
  { icon: IconTruck, label: "ارسال رایگان" },
  { icon: IconSpark, label: "طراحی اختصاصی" },
];

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <section className="relative py-24">
      {/* soft ambient tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(194,161,91,0.1),transparent_60%)]"
      />
      <div className="container-x relative">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="font-latin text-[10px] font-medium text-gold">
              FEATURED
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              محصولات ویژه
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-inksoft">
              چیزهایی که برای معمولی نبودن ساخته شده‌اند.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/shop"
              className="group flex items-center gap-2 text-sm font-extrabold text-inksoft transition-colors hover:text-ink"
            >
              مشاهده همه
              <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* values strip */}
        <Reveal delay={0.05} className="mb-10">
          <div className="flex flex-wrap gap-3">
            {VALUES.map((v) => (
              <span
                key={v.label}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-inksoft"
              >
                <v.icon className="h-4 w-4 text-gold" />
                {v.label}
              </span>
            ))}
          </div>
        </Reveal>

        <Stagger
          gap={0.09}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {featured.map((p, i) => (
            <StaggerItem
              key={p.slug}
              className={i === 0 ? "lg:col-span-2" : ""}
            >
              <ProductCard product={p} large={i === 0} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
