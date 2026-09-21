import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";
import { db } from "./index";
import { categories, products } from "./schema";

let seeded: Promise<void> | null = null;

/**
 * Idempotent lazy seed for the starter catalog.
 *
 * Multiple serverless instances may receive their first catalog request at the
 * same time, so every insert is conflict-safe and category IDs are read back
 * from the database rather than relying on a single process winning the race.
 */
export function ensureSeeded(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      const existingProducts = await db.select({ id: products.id }).from(products).limit(1);
      if (existingProducts.length > 0) return;

      await db.insert(categories).values(SEED_CATEGORIES.map((category) => ({
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        blurb: category.blurb,
        sort: category.sort,
      }))).onConflictDoNothing();

      const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
      const categoryIds = new Map(categoryRows.map((category) => [category.slug, category.id]));
      const seedRows = SEED_PRODUCTS.map((product) => {
        const categoryId = categoryIds.get(product.category);
        if (!categoryId) throw new Error(`Missing seed category: ${product.category}`);
        const { category: _category, ...rest } = product;
        return {
          ...rest,
          sku: `NV-${rest.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 60)}`,
          status: "active" as const,
          categoryId,
        };
      });
      await db.insert(products).values(seedRows).onConflictDoNothing();
    })().catch((error) => {
      seeded = null;
      throw error;
    });
  }
  return seeded;
}
