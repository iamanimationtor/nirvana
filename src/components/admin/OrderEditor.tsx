"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

const orderTransitions: Record<string, string[]> = {
  pending: ["pending", "cancelled"],
  confirmed: ["confirmed", "processing", "cancelled"],
  processing: ["processing", "preparing", "cancelled"],
  preparing: ["preparing", "shipped", "cancelled"],
  shipped: ["shipped", "delivered", "returned"],
  delivered: ["delivered", "returned"],
  returned: ["returned"],
  cancelled: ["cancelled"],
  refunded: ["refunded"],
};
const paymentTransitions: Record<string, string[]> = {
  unpaid: ["unpaid", "pending", "failed"],
  pending: ["pending", "failed"],
  failed: ["failed", "pending"],
  paid: ["paid"],
  partially_refunded: ["partially_refunded"],
  refunded: ["refunded"],
};
const shippingTransitions: Record<string, string[]> = {
  pending: ["pending", "preparing"],
  preparing: ["preparing", "shipped"],
  shipped: ["shipped", "delivered", "returned"],
  delivered: ["delivered", "returned"],
  returned: ["returned"],
};
const orderLabels: Record<string, string> = { pending: "در انتظار", confirmed: "تأییدشده", processing: "در حال پردازش", preparing: "در حال آماده‌سازی", shipped: "ارسال‌شده", delivered: "تحویل‌شده", cancelled: "لغوشده", returned: "مرجوعی", refunded: "بازپرداخت‌شده" };
const paymentLabels: Record<string, string> = { unpaid: "پرداخت‌نشده", pending: "در انتظار پرداخت", paid: "پرداخت‌شده", failed: "ناموفق", refunded: "بازپرداخت‌شده", partially_refunded: "بخشی بازپرداخت شده" };
const shippingLabels: Record<string, string> = { pending: "در انتظار", preparing: "در حال آماده‌سازی", shipped: "ارسال‌شده", delivered: "تحویل‌شده", returned: "مرجوعی" };

export function OrderEditor({ id, status, paymentStatus, shippingStatus, note }: { id: string; status: string; paymentStatus: string; shippingStatus: string; note: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const orderOptions = (orderTransitions[status] ?? [status]).filter((option) => option !== "cancelled" || !["paid", "partially_refunded"].includes(paymentStatus));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.get("status"),
          paymentStatus: form.get("paymentStatus"),
          shippingStatus: form.get("shippingStatus"),
          internalNote: form.get("internalNote"),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "به‌روزرسانی سفارش انجام نشد.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "به‌روزرسانی سفارش انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={submit} aria-busy={loading}>
      <div className="admin-section-heading"><div><h2>به‌روزرسانی سفارش</h2><p>فقط تغییرهای مجاز برای وضعیت فعلی نمایش داده می‌شوند.</p></div><span className="admin-section-icon"><AdminIcon name="orders" /></span></div>
      <div className="form-grid">
        <Field label="وضعیت سفارش" name="status" value={status} options={orderOptions} labels={orderLabels} />
        <Field label="وضعیت پرداخت" name="paymentStatus" value={paymentStatus} options={paymentTransitions[paymentStatus] ?? [paymentStatus]} labels={paymentLabels} />
        <Field label="وضعیت ارسال" name="shippingStatus" value={shippingStatus} options={shippingTransitions[shippingStatus] ?? [shippingStatus]} labels={shippingLabels} />
        <div className="field wide"><label htmlFor={`order-note-${id}`}>یادداشت داخلی</label><textarea className="textarea" id={`order-note-${id}`} name="internalNote" defaultValue={note} maxLength={2000} /></div>
      </div>
      {["paid", "partially_refunded"].includes(paymentStatus) && status !== "cancelled" && <p className="form-message" role="status">لغو سفارش پرداخت‌شده تا زمان اجرای بازپرداخت تأییدشده در دسترس نیست.</p>}
      {error && <p className="form-message error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="check" width="16" height="16" />{loading ? "در حال ثبت…" : "ثبت تغییرات"}</button>
    </form>
  );
}

function Field({ label, name, value, options, labels }: { label: string; name: string; value: string; options: string[]; labels: Record<string, string> }) {
  return <div className="field"><label htmlFor={`order-${name}`}>{label}</label><select className="select" id={`order-${name}`} name={name} defaultValue={value}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></div>;
}
