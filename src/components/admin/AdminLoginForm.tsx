"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "ورود به پنل انجام نشد.");

      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ورود به پنل انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit} noValidate aria-busy={loading}>
      <div className="field">
        <label htmlFor="admin-email">ایمیل مدیر</label>
        <input className="input" id="admin-email" name="email" type="email" autoComplete="username" inputMode="email" required dir="ltr" autoFocus />
      </div>
      <div className="field">
        <label htmlFor="admin-password">رمز عبور</label>
        <div className="password-input-wrap">
          <input className="input" id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={8} />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}>
            <AdminIcon name="eye" />
          </button>
        </div>
      </div>
      {error && <p className="form-message error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        <AdminIcon name={loading ? "activity" : "lock"} width="16" height="16" />
        {loading ? "در حال بررسی…" : "ورود امن به پنل"}
      </button>
    </form>
  );
}
