import { getProducts } from "@/db/queries";
import { fallbackProducts } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const category = url.searchParams.get("category") ?? "";

  let products: Awaited<ReturnType<typeof getProducts>>;
  try {
    products = await getProducts();
  } catch (err) {
    console.error("[api/products] db fallback", err);
    products = fallbackProducts();
  }

  let list = products;
  if (category) list = list.filter((p) => p.categorySlug === category);
  if (search) {
    list = list.filter((p) =>
      [p.name, p.nameEn, p.shortDesc, p.categoryName]
        .join(" ")
        .includes(search)
    );
  }

  return Response.json(list, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
