"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function DeleteProductButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function archive() {
    if (loading || !window.confirm("این محصول بایگانی شود؟ سفارش‌ها و سوابق قبلی حفظ می‌شوند.")) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "بایگانی محصول انجام نشد.");
      router.refresh();
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "بایگانی محصول انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return <button className="btn btn-danger" type="button" onClick={archive} disabled={loading}><AdminIcon name="trash" width="15" height="15" />{loading ? "…" : "حذف"}</button>;
}
