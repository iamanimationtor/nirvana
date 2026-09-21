"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "ثبت‌نام ناموفق بود");
        return;
      }
      await refresh();
      router.push(next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch {
      setError("خطا در اتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass mt-8 rounded-[28px] p-6">
      <label className="mb-2 block text-xs font-extrabold text-inksoft">نام</label>
      <input className="field mb-4" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <label className="mb-2 block text-xs font-extrabold text-inksoft">ایمیل</label>
      <input className="field mb-4" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <label className="mb-2 block text-xs font-extrabold text-inksoft">موبایل</label>
      <input className="field mb-4" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121234567" autoComplete="tel" />
      <label className="mb-2 block text-xs font-extrabold text-inksoft">رمز عبور</label>
      <input
        className="field mb-2"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <p className="mb-4 text-[11px] leading-5 text-inksoft">حداقل ۸ کاراکتر، شامل حرف و عدد.</p>
      {error && (
        <p className="mb-4 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
      <button disabled={loading} className="btn btn-primary w-full py-3.5 text-sm">
        {loading ? "در حال ثبت…" : "ایجاد حساب امن"}
      </button>
      <p className="mt-5 text-center text-xs text-inksoft">
        قبلاً حساب دارید؟{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-extrabold text-forest dark:text-neon">
          ورود
        </Link>
      </p>
    </form>
  );
}

export default function RegisterForm() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
