"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function AdminLogout({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button className={`admin-logout ${compact ? "is-compact" : ""}`} type="button" onClick={logout} disabled={loading} aria-label="خروج از پنل مدیریت">
      <AdminIcon name="logout" />
      {!compact && <span>{loading ? "در حال خروج…" : "خروج"}</span>}
    </button>
  );
}
