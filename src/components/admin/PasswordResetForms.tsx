"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function ForgotForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      if (!response.ok) throw new Error("ارسال درخواست ممکن نشد.");
      setMessage("اگر حساب مدیریتی معتبری وجود داشته باشد، پیوند بازیابی ارسال می‌شود.");
    } catch {
      setMessage("ارسال درخواست ممکن نشد؛ چند لحظه دیگر دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit} aria-busy={loading}>
      <div className="field">
        <label htmlFor="reset-email">ایمیل مدیر</label>
        <input className="input" id="reset-email" type="email" name="email" autoComplete="email" inputMode="email" required dir="ltr" autoFocus />
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="document" width="16" height="16" />{loading ? "در حال ارسال…" : "ارسال پیوند بازیابی"}</button>
    </form>
  );
}

export function ResetForm() {
  const token = useSearchParams().get("token") || "";
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.get("password") }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "تغییر رمز انجام نشد.");
      setMessage("رمز عبور تغییر کرد؛ در حال انتقال به صفحه ورود…");
      window.setTimeout(() => router.replace("/admin/login"), 900);
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "تغییر رمز انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="form-message error" role="alert">پیوند بازیابی معتبر نیست. لطفاً یک پیوند جدید درخواست کنید.</p>;
  }

  return (
    <form className="login-form" onSubmit={submit} aria-busy={loading}>
      <div className="field">
        <label htmlFor="new-admin-password">رمز جدید</label>
        <div className="password-input-wrap">
          <input className="input" id="new-admin-password" type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" minLength={12} required autoFocus />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}><AdminIcon name="eye" /></button>
        </div>
      </div>
      {message && <p className={`form-message ${isError ? "error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="lock" width="16" height="16" />{loading ? "در حال تغییر…" : "ثبت رمز جدید"}</button>
    </form>
  );
}
