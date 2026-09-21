import Image from "next/image";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { pool } from "@/db";
import { requireAdmin } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";

const sortable = ["name", "price", "stock", "created_at"] as const;
type Sort = (typeof sortable)[number];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin("products.view");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = 20;
  const search = (query.search || "").slice(0, 100);
  const status = query.status || "";
  const sort: Sort = sortable.includes(query.sort as Sort) ? query.sort as Sort : "created_at";
  const direction = query.dir === "asc" ? "ASC" : "DESC";
  const values: unknown[] = [];
  let where = "p.deleted_at IS NULL";

  if (search) {
    values.push(`%${search}%`);
    where += ` AND (p.name ILIKE $${values.length} OR p.sku ILIKE $${values.length})`;
  }
  if (status) {
    values.push(status);
    where += ` AND p.status=$${values.length}`;
  }

  const count = await pool.query(`SELECT COUNT(*)::int n FROM products p WHERE ${where}`, values);
  values.push(limit, (page - 1) * limit);
  const products = await pool.query(`SELECT p.id,p.name,p.sku,p.price,p.discount_percent,p.stock,p.min_stock,p.status,p.created_at,c.name category,p.images FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE ${where} ORDER BY p.${sort} ${direction} LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  const total = Number(count.rows[0].n);
  const pages = Math.max(1, Math.ceil(total / limit));
  const href = (nextPage: number) => productQuery({ page: String(nextPage), search, status, sort, dir: direction.toLowerCase() });

  return (
    <>
      <div className="page-head">
        <div><h1>محصولات</h1><p>{total.toLocaleString("fa-IR")} محصول در کاتالوگ · مدیریت موجودی و وضعیت انتشار</p></div>
        <Link className="btn btn-primary" href="/admin/products/new"><AdminIcon name="plus" width="16" height="16" />افزودن محصول</Link>
      </div>

      <form className="filters admin-products-filter">
        <div className="admin-filter-search"><AdminIcon name="search" /><input className="input" name="search" defaultValue={search} placeholder="جست‌وجو نام یا SKU…" /></div>
        <select className="select" name="status" defaultValue={status} aria-label="وضعیت محصول"><option value="">همه وضعیت‌ها</option><option value="active">فعال</option><option value="draft">پیش‌نویس</option><option value="inactive">غیرفعال</option><option value="archived">بایگانی</option></select>
        <select className="select" name="sort" defaultValue={sort} aria-label="مرتب‌سازی"><option value="created_at">جدیدترین</option><option value="name">نام محصول</option><option value="price">قیمت</option><option value="stock">موجودی</option></select>
        <input type="hidden" name="dir" value={direction.toLowerCase()} />
        <button className="btn btn-ghost" type="submit">اعمال فیلتر</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table product-table">
          <thead><tr><th>محصول</th><th>دسته</th><th>قیمت</th><th>موجودی</th><th>وضعیت</th><th>عملیات</th></tr></thead>
          <tbody>{products.rows.length ? products.rows.map((product) => {
            const image = Array.isArray(product.images) ? product.images[0] : null;
            const stock = Number(product.stock);
            const minStock = Number(product.min_stock);
            return <tr key={product.id}>
              <td><div className="product-table-title">{image ? <Image src={image} alt="" width={46} height={46} /> : <span className="product-table-placeholder"><AdminIcon name="cube" /></span>}<span><strong>{product.name}</strong><small dir="ltr">{product.sku}</small></span></div></td>
              <td>{product.category || "—"}</td>
              <td><strong>{formatPrice(Number(product.price) * (100 - Number(product.discount_percent)) / 100)}</strong>{Number(product.discount_percent) > 0 && <small className="product-discount">{Number(product.discount_percent)}٪ تخفیف</small>}</td>
              <td><span className={`badge ${stock === 0 ? "danger" : stock <= minStock ? "warning" : "success"}`}>{stock.toLocaleString("fa-IR")} عدد</span></td>
              <td><span className={`badge ${product.status === "active" ? "success" : product.status === "draft" ? "warning" : ""}`}>{statusLabel(product.status)}</span></td>
              <td><div className="product-row-actions"><Link className="btn btn-ghost" href={`/admin/products/${product.id}`}><AdminIcon name="edit" width="15" height="15" />ویرایش</Link><DeleteProductButton id={product.id} /></div></td>
            </tr>;
          }) : <tr><td colSpan={6}><div className="empty">محصولی با این فیلتر پیدا نشد.</div></td></tr>}</tbody>
        </table>
      </div>

      {pages > 1 && <nav className="pagination" aria-label="صفحه‌بندی محصولات">{page > 1 && <Link className="btn btn-ghost" href={href(page - 1)}>قبلی</Link>}<span className="badge">صفحه {page.toLocaleString("fa-IR")} از {pages.toLocaleString("fa-IR")}</span>{page < pages && <Link className="btn btn-ghost" href={href(page + 1)}>بعدی</Link>}</nav>}
    </>
  );
}

function productQuery(values: Record<string, string>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) search.set(key, value);
  return `?${search.toString()}`;
}

function statusLabel(status: string) {
  return ({ active: "فعال", draft: "پیش‌نویس", inactive: "غیرفعال", archived: "بایگانی" } as Record<string, string>)[status] ?? status;
}
