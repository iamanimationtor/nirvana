import { getProductBySlug, getRelated } from "@/db/queries";
import { fallbackProducts } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await context.params;

  let product = null as null | Awaited<ReturnType<typeof getProductBySlug>>;
  let related: Awaited<ReturnType<typeof getRelated>> = [];
  try {
    product = await getProductBySlug(slug);
    if (product) related = await getRelated(product, 4);
  } catch (err) {
    console.error("[api/products/slug] db fallback", err);
    const fb = fallbackProducts().find((p) => p.slug === slug) ?? null;
    product = fb;
    if (fb)
      related = fallbackProducts().filter((p) => p.id !== fb.id).slice(0, 4);
  }

  if (!product) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json({ product, related });
}
