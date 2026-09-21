import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "nirvana-product-images";
const LOCAL_DIRECTORY = path.join(process.cwd(), "public", "uploads", "products");
const KEY_PATTERN = /^[a-f0-9]{48}\.webp$/;

/** Netlify functions provide the Blob context automatically. */
function usesPersistentNetlifyStorage() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_SITE_ID);
}

function makeKey() {
  return `${randomBytes(24).toString("hex")}.webp`;
}

function toArrayBuffer(value: Uint8Array) {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

export async function saveProductMedia(data: Buffer): Promise<string> {
  const key = makeKey();
  if (usesPersistentNetlifyStorage()) {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const result = await store.set(key, new Blob([toArrayBuffer(data)], { type: "image/webp" }), {
      metadata: { contentType: "image/webp" },
      onlyIfNew: true,
    });
    if (!result.modified) throw new Error("Could not persist product image");
    return `/api/media/${key}`;
  }

  await mkdir(LOCAL_DIRECTORY, { recursive: true });
  await writeFile(path.join(LOCAL_DIRECTORY, key), data, { flag: "wx" });
  // Runtime writes to public/ are not guaranteed to be picked up by `next start`.
  // Serving both local files and Blobs through the same guarded route keeps the
  // upload URL correct in development, production-like local checks, and Netlify.
  return `/api/media/${key}`;
}

export async function readProductMedia(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  if (!KEY_PATTERN.test(key)) return null;

  if (usesPersistentNetlifyStorage()) {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!entry) return null;
    return {
      data: entry.data,
      contentType: typeof entry.metadata.contentType === "string" ? entry.metadata.contentType : "image/webp",
    };
  }

  try {
    return { data: toArrayBuffer(await readFile(path.join(LOCAL_DIRECTORY, key))), contentType: "image/webp" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
