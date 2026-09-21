import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";
import { isDatabaseConfigured } from "@/db";
import { getProductBySlug, getRelated } from "@/db/queries";
import { fallbackProducts } from "@/lib/seed-data";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let name = fallbackProducts().find((p) => p.slug === slug)?.name ?? "محصول";

  if (isDatabaseConfigured) {
    try {
      const p = await getProductBySlug(slug);
      if (p) name = p.name;
    } catch {
      // The storefront keeps its fallback metadata while the database recovers.
    }
  }

  return { title: name };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallbackProduct = fallbackProducts().find((p) => p.slug === slug) ?? null;
  let product = fallbackProduct as Awaited<ReturnType<typeof getProductBySlug>>;
  let related: Awaited<ReturnType<typeof getRelated>> = fallbackProduct
    ? fallbackProducts().filter((p) => p.id !== fallbackProduct.id).slice(0, 4)
    : [];

  if (isDatabaseConfigured) {
    try {
      product = await getProductBySlug(slug);
      if (product) related = await getRelated(product, 4);
    } catch (err) {
      console.error("[product] db fallback", err);
    }
  }

  if (!product) notFound();

  return (
    <ProductPageClient product={product} related={related} />
  );
}
