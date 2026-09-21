"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { IconShield } from "@/components/Icons";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/store/store";

export default function CheckoutClient({shippingFee=0}:{shippingFee?:number}) {
  const { items, total, clear, setCartOpen } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [province, setProvince] = useState("تهران");
  const [city, setCity] = useState("تهران");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name);
    setEmail((v) => v || user.email);
    setPhone((v) => v || user.phone || "");
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-screen flex-col items-center justify-center pb-24 pt-32 text-center">
        <h1 className="text-2xl font-extrabold">سبد خرید خالی است</h1>
        <Link href="/shop" className="btn btn-primary mt-6 px-8 py-3 text-sm">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          customer: { name, email, phone, province, city, address, postalCode, note },
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "ثبت سفارش ناموفق بود");
        return;
      }
      setCartOpen(false);
      clear();
      window.location.href = data.redirectUrl as string;
    } catch {
      setError("خطا در اتصال به درگاه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x min-h-screen pb-24 pt-32">
      <p className="font-latin text-[10px] font-medium text-gold">SECURE CHECKOUT</p>
      <h1 className="mt-2 text-3xl font-extrabold">تسویه حساب امن</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-inksoft">
        مبلغ سفارش از قیمت واقعی پایگاه داده محاسبه می‌شود. پرداخت از طریق درگاه زرین‌پال (یا درگاه آزمایشی امن در صورت نبود کلید) انجام می‌شود.
      </p>

      {!user && (
        <p className="mt-5 text-sm">
          برای ذخیره سفارش در حساب،{" "}
          <Link href="/login?next=/checkout" className="font-extrabold text-forest dark:text-neon">
            وارد شوید
          </Link>{" "}
          یا{" "}
          <Link href="/register?next=/checkout" className="font-extrabold text-forest dark:text-neon">
            ثبت‌نام کنید
          </Link>
          . خرید مهمان هم ممکن است.
        </p>
      )}

      <form onSubmit={pay} className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-[28px] p-6">
          <h2 className="mb-5 text-base font-extrabold">اطلاعات گیرنده</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">نام</label>
              <input className="field" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">موبایل</label>
              <input className="field" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912…" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-extrabold text-inksoft">ایمیل</label>
              <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">استان</label>
              <input className="field" required value={province} onChange={(e) => setProvince(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">شهر</label>
              <input className="field" required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-extrabold text-inksoft">نشانی</label>
              <textarea className="field !rounded-3xl" required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">کد پستی (اختیاری)</label>
              <input className="field" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-inksoft">یادداشت</label>
              <input className="field" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-linec bg-paper/80 p-6">
          <h2 className="mb-4 text-base font-extrabold">خلاصه سفارش</h2>
          <ul className="flex flex-col gap-3">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <span className="relative h-14 w-14 overflow-hidden rounded-xl">
                  <Image src={it.image} alt="" fill className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold">{it.name}</span>
                  <span className="text-[11px] text-inksoft">{formatPrice(it.price)}</span>
                </span>
              </li>
            ))}
          </ul>
          {shippingFee>0&&<div className="mt-5 flex items-center justify-between border-t border-linec pt-4 text-xs"><span>هزینه ارسال</span><span>{formatPrice(shippingFee)}</span></div>}
          <div className={`${shippingFee>0?"mt-2":"mt-5 border-t pt-4"} flex items-center justify-between border-linec`}>
            <span className="text-sm">جمع کل</span>
            <span className="text-lg font-extrabold">{formatPrice(total+shippingFee)}</span>
          </div>
          {error && (
            <p className="mt-4 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">{error}</p>
          )}
          <button disabled={loading} className="btn btn-primary mt-5 w-full py-4 text-sm">
            {loading ? "انتقال به درگاه…" : "پرداخت امن"}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-inksoft">
            <IconShield className="h-4 w-4 text-gold" />
            پرداخت روی بستر رمزنگاری‌شده
          </p>
          <button type="button" onClick={() => router.push("/shop")} className="mt-2 w-full py-2 text-xs text-inksoft">
            بازگشت
          </button>
        </aside>
      </form>
    </div>
  );
}
