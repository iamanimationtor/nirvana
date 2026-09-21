type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const SOFT_LIMIT=4000,MAX_BUCKETS=5000;
function prune(now:number){
  if(buckets.size<SOFT_LIMIT)return;
  for(const[key,bucket]of buckets)if(bucket.resetAt<=now)buckets.delete(key);
  // Keep process-local protection memory-bounded even during a distributed-key flood.
  while(buckets.size>=MAX_BUCKETS){const oldest=buckets.keys().next().value as string|undefined;if(oldest===undefined)break;buckets.delete(oldest)}
}

/** Sliding fixed-window limiter. Returns remaining ms if limited. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterMs: current.resetAt - now };
  }
  current.count += 1;
  return { ok: true };
}

export function limitedResponse(retryAfterMs: number) {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return Response.json(
    { ok: false, message: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید." },
    {
      status: 429,
      headers: { "Retry-After": String(seconds) },
    }
  );
}
