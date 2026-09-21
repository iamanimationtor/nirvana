"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

type Category = { id: number; name: string };
type Initial = Record<string, unknown> & { id?: number; images?: string[]; features?: string[]; tags?: string[]; variants?: string[] };

export function ProductForm({ categories, initial }: { categories: Category[]; initial?: Initial }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState(Number(initial?.price ?? 0));
  const [discount, setDiscount] = useState(Number(initial?.discountPercent ?? 0));
  const [slug, setSlug] = useState(value("slug"));
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.id));
  const finalPrice = useMemo(() => Math.round(price * (100 - discount) / 100), [price, discount]);

  async function upload(files: FileList | null) {
    if (!files || uploading) return;
    const available = Math.max(0, 12 - images.length);
    if (!available) {
      setMessage("حداکثر ۱۲ تصویر برای هر محصول قابل ثبت است.");
      return;
    }

    setUploading(true);
    setMessage("");
    try {
      for (const file of Array.from(files).slice(0, available)) {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "آپلود تصویر انجام نشد.");
        setImages((current) => [...current, payload.url]);
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "آپلود تصویر انجام نشد.");
    } finally {
      setUploading(false);
    }
  }

  function updateName(event: ChangeEvent<HTMLInputElement>) {
    if (!slugEdited && !initial?.id) setSlug(slugify(event.target.value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || uploading) return;
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const lines = (key: string) => String(form.get(key) || "").split("\n").map((item) => item.trim()).filter(Boolean);
    const payload = {
      name: form.get("name"),
      nameEn: form.get("nameEn"),
      sku: form.get("sku"),
      slug,
      categoryId: Number(form.get("categoryId")),
      price: Number(form.get("price")),
      oldPrice: form.get("oldPrice") ? Number(form.get("oldPrice")) : null,
      discountPercent: Number(form.get("discountPercent")),
      stock: Number(form.get("stock")),
      minStock: Number(form.get("minStock")),
      status: form.get("status"),
      featured: form.get("featured") === "on",
      brand: form.get("brand"),
      shortDesc: form.get("shortDesc"),
      description: form.get("description"),
      material: form.get("material"),
      prepTime: form.get("prepTime"),
      seoTitle: form.get("seoTitle"),
      seoDescription: form.get("seoDescription"),
      images,
      features: lines("features"),
      tags: lines("tags"),
      variants: lines("variants"),
      specifications: {},
      shipping: {},
    };

    try {
      const response = await fetch(initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "ذخیره محصول انجام نشد.");
      router.push("/admin/products");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "ذخیره محصول انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-product-form" onSubmit={submit} aria-busy={loading || uploading}>
      <div className="admin-product-layout">
        <div className="admin-product-main">
          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>اطلاعات اصلی</h2><p>نام، دسته‌بندی و توضیحات محصول را وارد کنید.</p></div><span className="admin-section-icon"><AdminIcon name="cube" /></span></div>
            <div className="form-grid">
              <Field label="نام محصول" htmlFor="product-name"><input className="input" id="product-name" name="name" defaultValue={value("name")} onChange={updateName} required maxLength={160} /></Field>
              <Field label="نام انگلیسی" htmlFor="product-name-en"><input className="input" id="product-name-en" name="nameEn" defaultValue={value("nameEn")} dir="ltr" maxLength={160} /></Field>
              <Field label="SKU / شناسه کالا" htmlFor="product-sku"><input className="input" id="product-sku" name="sku" defaultValue={value("sku")} required dir="ltr" maxLength={100} /></Field>
              <Field label="نشانی محصول" htmlFor="product-slug"><input className="input" id="product-slug" name="slug" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }} required dir="ltr" pattern="[a-z0-9-]+" maxLength={140} /><small className="admin-field-hint" dir="ltr">a-z, 0-9, -</small></Field>
              <Field label="دسته‌بندی" htmlFor="product-category"><select className="select" id="product-category" name="categoryId" defaultValue={value("categoryId")} required><option value="">انتخاب دسته‌بندی</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field>
              <Field label="برند" htmlFor="product-brand"><input className="input" id="product-brand" name="brand" defaultValue={value("brand")} maxLength={120} /></Field>
              <Field label="توضیح کوتاه" htmlFor="product-short-description" wide><textarea className="textarea" id="product-short-description" name="shortDesc" defaultValue={value("shortDesc")} maxLength={400} /></Field>
              <Field label="توضیحات کامل" htmlFor="product-description" wide><textarea className="textarea admin-textarea-large" id="product-description" name="description" defaultValue={value("description")} /></Field>
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>تصاویر محصول</h2><p>JPEG، PNG یا WebP تا ۵ مگابایت. اولین تصویر، تصویر اصلی است.</p></div><span className="admin-section-icon"><AdminIcon name="eye" /></span></div>
            <label className={`admin-upload-zone ${uploading ? "is-uploading" : ""}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => upload(event.target.files)} disabled={uploading} />
              <span className="admin-upload-icon"><AdminIcon name={uploading ? "activity" : "plus"} /></span>
              <strong>{uploading ? "در حال پردازش تصویرها…" : "انتخاب و آپلود تصویر"}</strong>
              <small>{images.length}/۱۲ تصویر ثبت شده</small>
            </label>
            {images.length > 0 && <div className="admin-image-grid">{images.map((src, index) => <div className="admin-image-item" key={src}><Image src={src} alt="" fill sizes="(max-width: 560px) 50vw, 160px" /><button className="admin-image-remove" type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="حذف تصویر"><AdminIcon name="close" /></button>{index === 0 && <span className="badge success">تصویر اصلی</span>}</div>)}</div>}
          </section>

          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>جزئیات و نمایش در فروشگاه</h2><p>ویژگی‌ها و انتخاب‌های محصول را هر کدام در یک خط ثبت کنید.</p></div><span className="admin-section-icon"><AdminIcon name="document" /></span></div>
            <div className="form-grid">
              <Field label="ویژگی‌ها" htmlFor="product-features"><textarea className="textarea" id="product-features" name="features" defaultValue={(initial?.features ?? []).join("\n")} /></Field>
              <Field label="گونه‌ها / رنگ‌ها" htmlFor="product-variants"><textarea className="textarea" id="product-variants" name="variants" defaultValue={(initial?.variants ?? []).join("\n")} /></Field>
              <Field label="برچسب‌ها" htmlFor="product-tags"><textarea className="textarea" id="product-tags" name="tags" defaultValue={(initial?.tags ?? []).join("\n")} /></Field>
              <div className="admin-tip"><AdminIcon name="check" /><span>این اطلاعات مستقیماً در صفحه محصول برای مشتری نمایش داده می‌شوند.</span></div>
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>تنظیمات سئو</h2><p>این مقادیر برای نمایش بهتر محصول در موتورهای جست‌وجو استفاده می‌شوند.</p></div><span className="admin-section-icon"><AdminIcon name="search" /></span></div>
            <div className="form-grid">
              <Field label="عنوان سئو" htmlFor="product-seo-title"><input className="input" id="product-seo-title" name="seoTitle" defaultValue={value("seoTitle")} maxLength={70} /></Field>
              <Field label="توضیح سئو" htmlFor="product-seo-description"><textarea className="textarea" id="product-seo-description" name="seoDescription" defaultValue={value("seoDescription")} maxLength={170} /></Field>
            </div>
          </section>
        </div>

        <aside className="admin-product-side">
          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>قیمت و موجودی</h2><p>قیمت نهایی به‌صورت خودکار محاسبه می‌شود.</p></div><span className="admin-section-icon"><AdminIcon name="trend" /></span></div>
            <div className="field"><label htmlFor="product-price">قیمت (تومان)</label><input className="input" id="product-price" name="price" type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} required /></div>
            <div className="field"><label htmlFor="product-old-price">قیمت قبل از تخفیف</label><input className="input" id="product-old-price" name="oldPrice" type="number" min="0" defaultValue={value("oldPrice")} /></div>
            <div className="field"><label htmlFor="product-discount">تخفیف درصدی</label><input className="input" id="product-discount" name="discountPercent" type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></div>
            <div className="admin-price-preview"><span>قیمت نهایی</span><strong>{finalPrice.toLocaleString("fa-IR")} تومان</strong></div>
            <div className="admin-side-divider" />
            <div className="field"><label htmlFor="product-stock">موجودی فعلی</label><input className="input" id="product-stock" name="stock" type="number" min="0" defaultValue={value("stock", "0")} required /></div>
            <div className="field"><label htmlFor="product-min-stock">آستانه هشدار</label><input className="input" id="product-min-stock" name="minStock" type="number" min="0" defaultValue={value("minStock", "5")} required /></div>
          </section>

          <section className="admin-card">
            <div className="admin-section-heading"><div><h2>انتشار</h2><p>وضعیت نمایش محصول در فروشگاه.</p></div><span className="admin-section-icon"><AdminIcon name="store" /></span></div>
            <div className="field"><label htmlFor="product-status">وضعیت</label><select className="select" id="product-status" name="status" defaultValue={value("status", "draft")}><option value="draft">پیش‌نویس</option><option value="active">فعال و قابل خرید</option><option value="inactive">غیرفعال</option><option value="archived">بایگانی</option></select></div>
            <div className="field"><label htmlFor="product-prep-time">زمان آماده‌سازی</label><input className="input" id="product-prep-time" name="prepTime" defaultValue={value("prepTime")} /></div>
            <div className="field"><label htmlFor="product-material">جنس / متریال</label><input className="input" id="product-material" name="material" defaultValue={value("material")} /></div>
            <label className="admin-check-row"><input type="checkbox" name="featured" defaultChecked={Boolean(initial?.featured)} /><span><strong>محصول ویژه</strong><small>در بخش محصولات ویژه نمایش داده شود.</small></span></label>
          </section>
        </aside>
      </div>

      {message && <p className="form-message error" role="alert">{message}</p>}
      <div className="admin-form-actions"><button className="btn btn-ghost" type="button" onClick={() => router.back()} disabled={loading}>انصراف</button><button className="btn btn-primary" type="submit" disabled={loading || uploading}><AdminIcon name="check" width="16" height="16" />{loading ? "در حال ذخیره…" : initial?.id ? "ذخیره تغییرات" : "ایجاد محصول"}</button></div>
    </form>
  );

  function value(key: string, fallback = "") {
    return String(initial?.[key] ?? fallback);
  }
}

function Field({ label, htmlFor, wide, children }: { label: string; htmlFor: string; wide?: boolean; children: ReactNode }) {
  return <div className={`field ${wide ? "wide" : ""}`}><label htmlFor={htmlFor}>{label}</label>{children}</div>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
