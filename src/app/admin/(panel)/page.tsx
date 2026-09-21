import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { dashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";

const number = (value: unknown) => Number(value || 0).toLocaleString("fa-IR");

export default async function Dashboard() {
  await requireAdmin("dashboard.view");
  const data = await dashboardData();
  const metrics = data.metrics;
  const maxRevenue = Math.max(1, ...data.trend.map((item) => Number(item.revenue)));
  const lowStock = Number(metrics.low_stock) + Number(metrics.out_stock);

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow"><span /> مرکز کنترل فروشگاه</p>
          <h1>صبح بخیر، همه‌چیز زیر نظر شماست.</h1>
          <p>نمایی زنده از فروش، سفارش‌ها و وضعیت موجودی نیروانا در یک نگاه.</p>
        </div>
        <div className="dashboard-hero-actions">
          <Link className="btn btn-ghost" href="/admin/orders"><AdminIcon name="orders" width="16" height="16" />سفارش‌ها</Link>
          <Link className="btn btn-primary" href="/admin/products/new"><AdminIcon name="plus" width="16" height="16" />افزودن محصول</Link>
        </div>
      </section>

      <section className="stat-grid" aria-label="شاخص‌های کلیدی فروشگاه">
        <Metric title="فروش امروز" value={formatPrice(Number(metrics.today_revenue))} note={`${number(metrics.today_orders)} سفارش امروز`} icon="trend" tone="gold" />
        <Metric title="فروش ماه" value={formatPrice(Number(metrics.month_revenue))} note="فقط سفارش‌های پرداخت‌شده" icon="chart" tone="forest" />
        <Metric title="سفارش‌های باز" value={number(metrics.pending_orders)} note={`${number(metrics.total_orders)} سفارش در کل`} icon="orders" tone="sand" />
        <Metric title="هشدار موجودی" value={number(lowStock)} note={`${number(metrics.out_stock)} محصول ناموجود`} icon="inventory" tone={lowStock ? "warning" : "forest"} />
      </section>

      <div className="admin-grid-2 dashboard-primary-grid">
        <section className="admin-card dashboard-chart-card">
          <div className="card-heading">
            <div><h2>روند درآمد</h2><p>۱۴ روز گذشته · سفارش‌های پرداخت‌شده</p></div>
            <Link href="/admin/analytics" className="card-link">تحلیل کامل<AdminIcon name="arrow" /></Link>
          </div>
          <div className="chart" aria-label="نمودار درآمد ۱۴ روز اخیر">
            {data.trend.map((item) => (
              <div
                key={String(item.day)}
                className="chart-bar"
                style={{ height: `${Math.max(4, (Number(item.revenue) / maxRevenue) * 100)}%` }}
                data-value={formatPrice(Number(item.revenue))}
                title={`${new Date(item.day).toLocaleDateString("fa-IR")}: ${formatPrice(Number(item.revenue))}`}
              />
            ))}
          </div>
          <div className="chart-caption"><span>۱۴ روز پیش</span><span>امروز</span></div>
        </section>

        <section className="admin-card stock-card">
          <div className="card-heading">
            <div><h2>نیازمند رسیدگی</h2><p>محصولاتی که به آستانه موجودی رسیده‌اند.</p></div>
            <span className={`badge ${lowStock ? "warning" : "success"}`}>{lowStock ? `${number(lowStock)} مورد` : "مناسب"}</span>
          </div>
          <div className="alert-list">
            {data.alerts.length ? data.alerts.map((item) => (
              <Link className="alert-item" href={`/admin/products/${item.id}`} key={item.id}>
                <span><strong>{item.name}</strong><small dir="ltr">{item.sku}</small></span>
                <span className={`badge ${Number(item.stock) === 0 ? "danger" : "warning"}`}>{Number(item.stock) === 0 ? "ناموجود" : `${number(item.stock)} عدد`}</span>
              </Link>
            )) : <div className="admin-empty-state"><span><AdminIcon name="check" /></span><strong>انبار در وضعیت خوبی است</strong><p>هیچ محصولی به آستانه هشدار نرسیده است.</p></div>}
          </div>
        </section>
      </div>

      <section className="dashboard-orders">
        <div className="page-head">
          <div><h2>آخرین سفارش‌ها</h2><p>به‌روزرسانی‌شده بر اساس آخرین ثبت سفارش</p></div>
          <Link className="btn btn-ghost" href="/admin/orders">مشاهده همه<AdminIcon name="arrow" width="16" height="16" /></Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>شماره سفارش</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>زمان ثبت</th></tr></thead>
            <tbody>{data.recent.length ? data.recent.map((item) => (
              <tr key={item.public_id}>
                <td><Link href={`/admin/orders/${item.public_id}`}>{item.public_id}</Link></td>
                <td>{item.customer_name}</td>
                <td>{formatPrice(Number(item.total_toman))}</td>
                <td><span className={`badge ${orderTone(item.status)}`}>{orderLabel(item.status)}</span></td>
                <td>{new Date(item.created_at).toLocaleDateString("fa-IR")}</td>
              </tr>
            )) : <tr><td colSpan={5}><div className="empty">هنوز سفارشی ثبت نشده است.</div></td></tr>}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Metric({ title, value, note, icon, tone }: { title: string; value: string; note: string; icon: "trend" | "chart" | "orders" | "inventory"; tone: string }) {
  return <article className={`stat-card metric-card tone-${tone}`}><div className="stat-top"><span>{title}</span><span className="metric-icon"><AdminIcon name={icon} /></span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}

function orderLabel(status: string) {
  return ({ pending: "در انتظار", confirmed: "تأییدشده", processing: "در حال پردازش", preparing: "در حال آماده‌سازی", shipped: "ارسال‌شده", delivered: "تحویل‌شده", cancelled: "لغوشده", returned: "مرجوعی", refunded: "بازپرداخت" } as Record<string, string>)[status] ?? status;
}

function orderTone(status: string) {
  if (["delivered", "confirmed"].includes(status)) return "success";
  if (["cancelled", "returned", "refunded"].includes(status)) return "danger";
  return "warning";
}
