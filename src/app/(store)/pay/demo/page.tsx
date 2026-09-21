"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconShield } from "@/components/Icons";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const authority = params.get("a") ?? "";
  const token = params.get("t") ?? "";
  const [loading, setLoading] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState("");

  const act = async (action: "pay" | "cancel") => {
    setLoading(action);
    setError("");
    try {
      const res = await fetch("/api/payment/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ authority, token, action }),
      });
      const data = await res.json();
      if (action === "pay" && data.ok && data.paid) {
        router.replace(
          `/pay/result?ok=1&id=${encodeURIComponent(data.publicId)}&ref=${encodeURIComponent(data.refId ?? "")}`
        );
        return;
      }
      if (action === "cancel") {
        router.replace(`/pay/result?ok=0&id=${encodeURIComponent(data.publicId ?? "")}`);
        return;
      }
      setError(data.message ?? "پرداخت انجام نشد");
    } catch {
      setError("خطا در اتصال");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container-x flex min-h-screen items-center justify-center pb-24 pt-32">
      <div className="glass w-full max-w-md rounded-[32px] p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold">
          <IconShield className="h-7 w-7" />
        </span>
        <p className="font-latin mt-5 text-[10px] text-gold">ZARINPAL · SANDBOX</p>
        <h1 className="mt-2 text-2xl font-extrabold">درگاه پرداخت آزمایشی</h1>
        <p className="mt-3 text-sm leading-7 text-inksoft">
          کلید زرین‌پال در محیط تنظیم نشده؛ این صفحه شبیه‌سازی امن درگاه است. با قرار دادن
          <span className="font-latin mx-1">ZARINPAL_MERCHANT_ID</span>
          پرداخت واقعی فعال می‌شود.
        </p>
        {error && <p className="mt-4 text-xs font-bold text-red-600">{error}</p>}
        <button
          disabled={!!loading}
          onClick={() => act("pay")}
          className="btn btn-primary mt-6 w-full py-4 text-sm"
        >
          {loading === "pay" ? "در حال تأیید…" : "پرداخت موفق"}
        </button>
        <button
          disabled={!!loading}
          onClick={() => act("cancel")}
          className="mt-3 w-full py-3 text-xs font-bold text-inksoft"
        >
          انصراف از پرداخت
        </button>
      </div>
    </div>
  );
}

export default function DemoPayPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
