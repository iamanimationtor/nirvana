"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function ChangePasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setError(false);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "تغییر رمز انجام نشد.");
      setMessage("رمز عبور تغییر کرد؛ برای امنیت بیشتر باید دوباره وارد شوید.");
      window.setTimeout(() => router.replace("/admin/login"), 1000);
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "تغییر رمز انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-card admin-narrow-form" onSubmit={submit} aria-busy={loading}>
      <div className="field"><label htmlFor="current-admin-password">رمز فعلی</label><input className="input" id="current-admin-password" name="currentPassword" type="password" autoComplete="current-password" required /></div>
      <div className="field"><label htmlFor="new-password">رمز جدید</label><input className="input" id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} required /><small className="admin-field-hint">حداقل ۱۲ کاراکتر، شامل حرف و عدد.</small></div>
      {message && <p className={`form-message ${error ? "error" : ""}`} role={error ? "alert" : "status"}>{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="lock" width="16" height="16" />{loading ? "در حال ثبت…" : "تغییر رمز عبور"}</button>
    </form>
  );
}
