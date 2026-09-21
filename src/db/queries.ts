import type { Category, Product } from "@/lib/types";
import { unstable_cache } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import { ensureSeeded } from "./seed";
import { categories, products } from "./schema";

type ProductRow = typeof products.$inferSelect;

export const CATALOG_REVALIDATE = 600;

function mapProduct(row: ProductRow, cat: Category | undefined): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    price: Math.round(row.price*(100-row.discountPercent)/100),
    oldPrice: row.discountPercent>0?row.price:row.oldPrice,
    categoryId: row.categoryId,
    categorySlug: cat?.slug ?? "",
    categoryName: cat?.name ?? "",
    shortDesc: row.shortDesc,
    description: row.description,
    features: row.features ?? [],
    variants: row.variants ?? [],
    images: row.images ?? [],
    stock: row.stock,
    prepTime: row.prepTime,
    material: row.material,
    featured: row.featured,
  };
}

const loadCategories = unstable_cache(
  async (): Promise<Category[]> => {
    await ensureSeeded();
    const rows = await db.select().from(categories).orderBy(categories.sort);
    return rows as unknown as Category[];
  },
  ["nirvana-categories"],
  { revalidate: CATALOG_REVALIDATE, tags: ["nirvana-catalog"] }
);

const loadProducts = unstable_cache(
  async (): Promise<Product[]> => {
    // Seeding is performed by loadCategories. It must finish before selecting
    // products, otherwise a first request on an empty deployment can cache an
    // empty catalog while another concurrent query is still inserting seed data.
    const cats = await loadCategories();
    const rows = await db.select().from(products).where(and(eq(products.status, "active"), isNull(products.deletedAt)));
    const byId = new Map(cats.map((c) => [c.id, c]));
    return rows.map((r) => mapProduct(r, byId.get(r.categoryId)));
  },
  ["nirvana-products"],
  { revalidate: CATALOG_REVALIDATE, tags: ["nirvana-catalog"] }
);

const loadProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    // Ensure a brand-new database has its catalog before looking up a slug.
    const cats = await loadCategories();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, "active"), isNull(products.deletedAt)))
      .limit(1);
    if (rows.length === 0) return null;
    return mapProduct(rows[0], cats.find((c) => c.id === rows[0].categoryId));
  },
  ["nirvana-product"],
  { revalidate: CATALOG_REVALIDATE, tags: ["nirvana-catalog"] }
);

export async function getCategories(): Promise<Category[]> {
  return loadCategories();
}

export async function getProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return loadProductBySlug(slug);
}

export async function getRelated(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const all = await getProducts();
  const sameCat = all.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  );
  const others = all.filter(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId
  );
  return [...sameCat, ...others].slice(0, limit);
}
