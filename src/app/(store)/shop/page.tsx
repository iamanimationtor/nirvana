import { Reveal } from "@/components/Reveal";
import ShopClient from "./ShopClient";
import { isDatabaseConfigured } from "@/db";
import { getCategories, getProducts } from "@/db/queries";
import { fallbackCategories, fallbackProducts } from "@/lib/seed-data";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "فروشگاه" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  let products: Product[] = fallbackProducts();
  let categories: Category[] = fallbackCategories();

  if (isDatabaseConfigured) {
    try {
      [products, categories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
    } catch (err) {
      console.error("[shop] db fallback", err);
    }
  }

  const active = categories.find((c) => c.slug === cat);

  return (
    <div className="min-h-screen pt-32 pb-10">
      <div className="container-x">
        <Reveal>
          <span className="font-latin text-[10px] font-medium text-gold">
            THE SHOP
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
            فروشگاه نیروانا
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-inksoft">
            {active
              ? `دستهٔ «${active.name}» — ${active.blurb}`
              : "تمام آثار گالری؛ از گلدان‌های ارگانیک تا فیگورهای گیمینگ — هر کدام با داستانی از لایه‌های چاپ."}
          </p>
        </Reveal>
      </div>
      <div className="mt-10">
        <ShopClient products={products} categories={categories} />
      </div>
    </div>
  );
}
