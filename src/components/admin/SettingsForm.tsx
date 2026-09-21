"use client";

import { useState, type FormEvent } from "react";
import { AdminIcon } from "./AdminIcon";

type FieldName = "store.name" | "store.email" | "store.phone" | "store.currency" | "inventory.defaultThreshold" | "orders.shippingFee" | "seo.defaultTitle";

export function SettingsForm({ values }: { values: Record<string, unknown> }) {
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
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "ذخیره تنظیمات انجام نشد.");
      setMessage("تنظیمات با موفقیت ذخیره شد.");
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "ذخیره تنظیمات انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="admin-card" aria-busy={loading}>
      <div className="admin-section-heading"><div><h2>تنظیمات فروشگاه</h2><p>اطلاعاتی که در تجربه خرید و داده‌های فروشگاه استفاده می‌شوند.</p></div><span className="admin-section-icon"><AdminIcon name="settings" /></span></div>
      <div className="form-grid">
        <Field name="store.name" label="نام فروشگاه" values={values} />
        <Field name="store.email" label="ایمیل تماس" values={values} type="email" dir="ltr" />
        <Field name="store.phone" label="تلفن تماس" values={values} dir="ltr" />
        <Field name="store.currency" label="واحد پول" values={values} />
        <Field name="inventory.defaultThreshold" label="آستانه پیش‌فرض انبار" values={values} type="number" min={0} />
        <Field name="orders.shippingFee" label="هزینه ارسال (تومان)" values={values} type="number" min={0} />
        <Field name="seo.defaultTitle" label="عنوان پیش‌فرض سئو" values={values} />
        <div className="field wide"><label htmlFor="setting-seo-description">توضیح پیش‌فرض سئو</label><textarea className="textarea" id="setting-seo-description" name="seo.defaultDescription" defaultValue={String(values["seo.defaultDescription"] ?? "")} maxLength={300} required /></div>
      </div>
      {message && <p className={`form-message ${isError ? "error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="check" width="16" height="16" />{loading ? "در حال ذخیره…" : "ذخیره تنظیمات"}</button>
    </form>
  );
}

function Field({ name, label, values, type = "text", min, dir }: { name: FieldName; label: string; values: Record<string, unknown>; type?: "text" | "email" | "number"; min?: number; dir?: "ltr" | "rtl" }) {
  const id = `setting-${name.replace(".", "-")}`;
  return <div className="field"><label htmlFor={id}>{label}</label><input className="input" id={id} name={name} type={type} min={min} defaultValue={String(values[name] ?? "")} dir={dir} required /></div>;
}
