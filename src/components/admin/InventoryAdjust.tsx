"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function InventoryAdjust({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: Number(form.get("quantity")), reason: form.get("reason") }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "ثبت تغییر موجودی انجام نشد.");
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت تغییر موجودی انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)}><AdminIcon name="inventory" width="15" height="15" />تنظیم موجودی</button>
      {open && (
        <div className="admin-dialog-layer" role="presentation">
          <button className="admin-dialog-backdrop" type="button" aria-label="بستن پنجره" onClick={() => setOpen(false)} />
          <form className="admin-dialog" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby={`inventory-title-${id}`} aria-busy={loading}>
            <div className="admin-dialog-heading">
              <div><span className="admin-dialog-icon"><AdminIcon name="inventory" /></span><h2 id={`inventory-title-${id}`}>اصلاح موجودی</h2><p>{name}</p></div>
              <button className="admin-dialog-close" type="button" onClick={() => setOpen(false)} aria-label="بستن"><AdminIcon name="close" /></button>
            </div>
            <div className="field"><label htmlFor={`inventory-quantity-${id}`}>تغییر موجودی</label><input className="input" id={`inventory-quantity-${id}`} name="quantity" type="number" required autoFocus placeholder="مثبت برای افزایش، منفی برای کاهش" /></div>
            <div className="field"><label htmlFor={`inventory-reason-${id}`}>دلیل تغییر</label><input className="input" id={`inventory-reason-${id}`} name="reason" required minLength={3} maxLength={300} placeholder="مثلاً رسیدن محموله جدید" /></div>
            {error && <p className="form-message error" role="alert">{error}</p>}
            <div className="admin-dialog-actions"><button className="btn btn-ghost" type="button" onClick={() => setOpen(false)} disabled={loading}>انصراف</button><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "در حال ثبت…" : "ثبت قطعی"}</button></div>
          </form>
        </div>
      )}
    </>
  );
}
