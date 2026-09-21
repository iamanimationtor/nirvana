import { readProductMedia } from "@/lib/product-media";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  try {
    const media = await readProductMedia(key);
    if (!media) return new Response("Not found", { status: 404 });
    return new Response(media.data, {
      headers: {
        "Content-Type": media.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[media] retrieval failed", error);
    return new Response("Unavailable", { status: 503 });
  }
}
