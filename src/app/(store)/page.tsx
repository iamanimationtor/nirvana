import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";
import LazyCollection from "@/components/LazyCollection";
import LazyInstagram from "@/components/LazyInstagram";
import { isDatabaseConfigured } from "@/db";
import { getCategories, getProducts } from "@/db/queries";
import { fallbackCategories, fallbackProducts } from "@/lib/seed-data";
import type { Category, Product } from "@/lib/types";

export const revalidate = 600;

const MARQUEE_ITEMS = [
  "نیروانا ۳دی",
  "NIRVANA 3D",
  "هنر سه‌بعدی",
  "3D PRINTED",
  "گالری اثر",
  "MADE WITH ART",
];

function Marquee() {
  return (
    <div
      dir="ltr"
      className="relative overflow-hidden border-y border-ivory/10 bg-forest py-3.5 text-ivory"
    >
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {MARQUEE_ITEMS.map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-8 whitespace-nowrap pe-8 text-sm font-extrabold tracking-wide"
              >
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_rgba(163,245,90,.9)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  let products: Product[] = fallbackProducts();
  let categories: Category[] = fallbackCategories();

  if (isDatabaseConfigured) {
    try {
      [products, categories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
    } catch (err) {
      console.error("[home] db fallback", err);
    }
  }

  const heroProduct =
    products.find((p) => p.slug === "wave-vase") ?? products[0];

  return (
    <>
      <Hero product={heroProduct} />
      <Marquee />
      <CategorySection categories={categories} />
      <FeaturedProducts products={products} />
      <LazyCollection />
      <LazyInstagram />
    </>
  );
}
