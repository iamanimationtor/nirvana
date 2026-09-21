"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { faNumber, formatPrice } from "@/lib/format";
import type { PublicUser } from "@/lib/auth-types";

const STATUS: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  cancelled: "لغو شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
};

export default function AccountClient({
  user,
  orders,
}: {
  user: PublicUser;
  orders: {
    publicId: string;
    status: string;
    totalToman: number;
    createdAt: string;
    items: { name: string; qty: number; unitPrice: number }[];
    refId: string | null;
  }[];
}) {
  const router = useRouter();
  const { logout, refresh } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [msg, setMsg] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setMsg(data.ok ? "اطلاعات ذخیره شد ✓" : data.message);
    if (data.ok) await refresh();
  };

  return (
    <div className="container-x min-h-screen pb-24 pt-32">
      <p className="font-latin text-[10px] font-medium text-gold">YOUR GALLERY</p>
      <h1 className="mt-2 text-3xl font-extrabold">حساب کاربری</h1>
      <p className="mt-2 text-sm text-inksoft">{user.email}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.3fr]">
        <form onSubmit={save} className="glass h-fit rounded-[28px] p-6">
          <h2 className="mb-4 text-base font-extrabold">اطلاعات شخصی</h2>
          <label className="mb-2 block text-xs font-extrabold text-inksoft">نام</label>
          <input className="field mb-4" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="mb-2 block text-xs font-extrabold text-inksoft">موبایل</label>
          <input className="field mb-4" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {msg && <p className="mb-4 text-xs font-bold text-forest dark:text-neon">{msg}</p>}
          <button className="btn btn-primary w-full py-3 text-sm">ذخیره</button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
              router.refresh();
            }}
            className="mt-3 w-full py-2 text-xs font-bold text-inksoft"
          >
            خروج از حساب
          </button>
        </form>

        <div>
          <h2 className="mb-4 text-base font-extrabold">سفارش‌ها</h2>
          {orders.length === 0 ? (
            <div className="rounded-[24px] border border-linec p-8 text-sm text-inksoft">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {orders.map((o) => (
                <li key={o.publicId} className="rounded-[24px] border border-linec bg-paper/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-latin text-xs">{o.publicId}</span>
                    <span className="rounded-full bg-olive/15 px-3 py-1 text-[11px] font-extrabold text-olivedeep dark:bg-neon/15 dark:text-neon">
                      {STATUS[o.status] ?? o.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-extrabold">{formatPrice(o.totalToman)}</p>
                  <ul className="mt-2 text-xs text-inksoft">
                    {o.items.map((i) => (
                      <li key={i.name}>
                        {i.name} × {faNumber(i.qty)}
                      </li>
                    ))}
                  </ul>
                  {o.refId && (
                    <p className="mt-2 text-[11px] text-inksoft">کد پیگیری: {o.refId}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
