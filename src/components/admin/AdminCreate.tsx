"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

const roles = [
  ["admin", "مدیر"],
  ["manager", "مدیر فروشگاه"],
  ["inventory_manager", "مسئول انبار"],
  ["order_manager", "مسئول سفارش"],
  ["support", "پشتیبانی"],
] as const;

export function AdminCreate() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "ایجاد حساب انجام نشد.");
      event.currentTarget.reset();
      setMessage("حساب مدیر جدید با موفقیت ایجاد شد.");
      router.refresh();
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "ایجاد حساب انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return <form className="admin-card" onSubmit={submit} aria-busy={loading}><div className="admin-section-heading"><div><h2>افزودن مدیر</h2><p>دسترسی واقعی در API نیز کنترل می‌شود.</p></div><span className="admin-section-icon"><AdminIcon name="users" /></span></div><div className="form-grid"><div className="field"><label htmlFor="admin-create-name">نام</label><input className="input" id="admin-create-name" name="name" required maxLength={80} /></div><div className="field"><label htmlFor="admin-create-email">ایمیل</label><input className="input" id="admin-create-email" name="email" type="email" dir="ltr" required /></div><div className="field"><label htmlFor="admin-create-password">رمز موقت</label><input className="input" id="admin-create-password" name="password" type="password" minLength={12} autoComplete="new-password" required /><small className="admin-field-hint">حداقل ۱۲ کاراکتر، شامل حرف و عدد.</small></div><div className="field"><label htmlFor="admin-create-role">نقش</label><select className="select" id="admin-create-role" name="role">{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div></div>{message && <p className={`form-message ${isError ? "error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}<button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="plus" width="16" height="16" />{loading ? "در حال ایجاد…" : "ایجاد حساب مدیر"}</button></form>;
}
