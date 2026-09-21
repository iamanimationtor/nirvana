"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

export function CategoryCreate() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function onNameChange(event: ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(slugify(event.target.value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(form), slug }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "افزودن دسته‌بندی انجام نشد.");
      event.currentTarget.reset();
      setSlug("");
      setSlugEdited(false);
      setMessage("دسته‌بندی جدید ثبت شد.");
      router.refresh();
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "افزودن دسته‌بندی انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return <form className="admin-card" onSubmit={submit} aria-busy={loading}><div className="admin-section-heading"><div><h2>دسته جدید</h2><p>برای نظم بهتر فروشگاه، نام و نشانی یکتا وارد کنید.</p></div><span className="admin-section-icon"><AdminIcon name="box" /></span></div><div className="form-grid"><div className="field"><label htmlFor="category-name">نام</label><input className="input" id="category-name" name="name" onChange={onNameChange} required maxLength={100} /></div><div className="field"><label htmlFor="category-slug">نشانی</label><input className="input" id="category-slug" name="slug" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }} dir="ltr" required pattern="[a-z0-9-]+" maxLength={100} /></div><div className="field"><label htmlFor="category-icon">آیکن</label><input className="input" id="category-icon" name="icon" maxLength={20} placeholder="مثلاً ✦" /></div><div className="field"><label htmlFor="category-blurb">توضیح</label><input className="input" id="category-blurb" name="blurb" maxLength={300} /></div></div>{message && <p className={`form-message ${isError ? "error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>}<button className="btn btn-primary" type="submit" disabled={loading}><AdminIcon name="plus" width="16" height="16" />{loading ? "در حال ثبت…" : "افزودن دسته"}</button></form>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
