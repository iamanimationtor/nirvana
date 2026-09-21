"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("در حال تأیید پرداخت…");

  useEffect(() => {
    const authority = params.get("Authority") ?? params.get("authority") ?? "";
    const status = params.get("Status") ?? params.get("status") ?? "";
    const qs = new URLSearchParams({ Authority: authority, Status: status });
    fetch(`/api/payment/verify?${qs.toString()}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.paid) {
          router.replace(
            `/pay/result?ok=1&id=${encodeURIComponent(data.publicId)}&ref=${encodeURIComponent(data.refId ?? "")}`
          );
        } else {
          router.replace(
            `/pay/result?ok=0&id=${encodeURIComponent(data.publicId ?? "")}&msg=${encodeURIComponent(data.message ?? "")}`
          );
        }
      })
      .catch(() => setMsg("تأیید پرداخت با خطا مواجه شد"));
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center pt-24 text-sm font-bold text-inksoft">
      {msg}
    </div>
  );
}

export default function PayCallbackPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
