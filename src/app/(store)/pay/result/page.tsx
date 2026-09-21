"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconCheck } from "@/components/Icons";

function Inner() {
  const params = useSearchParams();
  const ok = params.get("ok") === "1";
  const id = params.get("id") ?? "";
  const ref = params.get("ref") ?? "";
  const msg = params.get("msg") ?? "";

  return (
    <div className="container-x flex min-h-screen items-center justify-center pb-24 pt-32">
      <div className="glass w-full max-w-md rounded-[32px] p-8 text-center">
        <span
          className={
            "mx-auto grid h-16 w-16 place-items-center rounded-full " +
            (ok ? "bg-neon text-pine" : "bg-red-500/15 text-red-500")
          }
        >
          {ok ? <IconCheck className="h-7 w-7" /> : "!"}
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">
          {ok ? "پرداخت با موفقیت انجام شد" : "پرداخت انجام نشد"}
        </h1>
        {id && <p className="font-latin mt-3 text-xs text-inksoft">{id}</p>}
        {ref && <p className="mt-1 text-xs text-inksoft">کد پیگیری: {ref}</p>}
        {!ok && msg && <p className="mt-3 text-xs text-red-600">{msg}</p>}
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/account" className="btn btn-primary py-3.5 text-sm">
            مشاهده سفارش‌ها
          </Link>
          <Link href="/shop" className="text-xs font-bold text-inksoft">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PayResultPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
