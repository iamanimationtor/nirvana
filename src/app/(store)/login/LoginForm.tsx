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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "ورود ناموفق بود");
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
      <label className="mb-2 block text-xs font-extrabold text-inksoft">ایمیل</label>
      <input
        className="field mb-4"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="mb-2 block text-xs font-extrabold text-inksoft">رمز عبور</label>
      <input
        className="field mb-4"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p className="mb-4 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
      <button disabled={loading} className="btn btn-primary w-full py-3.5 text-sm">
        {loading ? "در حال ورود…" : "ورود امن"}
      </button>
      <p className="mt-5 text-center text-xs text-inksoft">
        حساب ندارید؟{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-extrabold text-forest dark:text-neon">
          ثبت‌نام
        </Link>
      </p>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
