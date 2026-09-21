import { pool } from "@/db";

export function dateRange(period: string | undefined, from?: string, to?: string) {
  const end = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59.999Z`) : new Date();
  const start = new Date(end);
  if (period === "today") start.setHours(0, 0, 0, 0);
  else if (period === "yesterday") { start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); end.setTime(start.getTime() + 86_400_000 - 1); }
  else if (period === "month") start.setDate(start.getDate() - 30);
  else if (period === "year") start.setFullYear(start.getFullYear() - 1);
  else if (period === "custom" && from && /^\d{4}-\d{2}-\d{2}$/.test(from)) start.setTime(new Date(`${from}T00:00:00Z`).getTime());
  else start.setDate(start.getDate() - 7);
  return { start, end };
}

function utcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dayKey(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export async function dashboardData() {
  const now = new Date();
  const today = utcDay(now);
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const year = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const trendStart = new Date(today);
  trendStart.setUTCDate(trendStart.getUTCDate() - 13);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const [metrics, trendRows, alerts, recent, counts] = await Promise.all([
    pool.query(`SELECT
      COALESCE(SUM(total_toman) FILTER (WHERE paid_at >= $1),0)::bigint AS today_revenue,
      COUNT(*) FILTER (WHERE created_at >= $1)::int AS today_orders,
      COALESCE(SUM(total_toman) FILTER (WHERE paid_at >= $2),0)::bigint AS month_revenue,
      COALESCE(SUM(total_toman) FILTER (WHERE paid_at >= $3),0)::bigint AS year_revenue,
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE status='pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status='delivered')::int AS completed_orders,
      COUNT(*) FILTER (WHERE status='cancelled')::int AS cancelled_orders
      FROM orders`, [today, month, year]),
    pool.query(`SELECT created_at::date AS bucket_date,
      COALESCE(SUM(total_toman) FILTER (WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint AS revenue,
      COUNT(*)::int AS orders
      FROM orders WHERE created_at >= $1 AND created_at < $2 GROUP BY 1 ORDER BY 1`, [trendStart, tomorrow]),
    pool.query(`SELECT id,name,sku,stock,min_stock FROM products WHERE deleted_at IS NULL AND status <> 'archived' AND stock <= min_stock ORDER BY stock ASC LIMIT 8`),
    pool.query(`SELECT public_id,customer_name,total_toman,status,created_at FROM orders ORDER BY created_at DESC LIMIT 6`),
    pool.query(`SELECT
      (SELECT COUNT(*) FROM users WHERE role='customer')::int AS customers,
      (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL)::int AS products,
      (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL AND stock>0 AND stock<=min_stock)::int AS low_stock,
      (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL AND stock=0)::int AS out_stock`),
  ]);

  const daily = new Map(trendRows.rows.map((row) => [dayKey(row.bucket_date), row]));
  const trend = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(trendStart);
    day.setUTCDate(day.getUTCDate() + index);
    const key = dayKey(day);
    const row = daily.get(key);
    return { day: key, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  return { metrics: { ...metrics.rows[0], ...counts.rows[0] }, trend, alerts: alerts.rows, recent: recent.rows };
}

export async function reportData(start: Date, end: Date) {
  const [summary, trend, best] = await Promise.all([
    pool.query(`SELECT COUNT(*) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded'))::int order_count,COALESCE(SUM(subtotal_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint gross_sales,COALESCE(SUM(discount_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint discounts,COALESCE(SUM(shipping_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint shipping,COALESCE(SUM(total_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint revenue,COALESCE(AVG(total_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint avg_order,COALESCE((SELECT SUM(amount_toman) FROM refunds WHERE status='completed' AND created_at BETWEEN $1 AND $2),0)::bigint refunds FROM orders WHERE created_at BETWEEN $1 AND $2`, [start, end]),
    pool.query(`SELECT created_at::date bucket_date,COUNT(*)::int orders,COALESCE(SUM(total_toman) FILTER(WHERE paid_at IS NOT NULL AND status NOT IN ('cancelled','refunded')),0)::bigint revenue FROM orders WHERE created_at BETWEEN $1 AND $2 GROUP BY 1 ORDER BY 1`, [start, end]),
    pool.query(`SELECT oi.product_id,oi.name,oi.sku,SUM(oi.qty)::int units,SUM(oi.qty*oi.unit_price)::bigint revenue,MAX(p.stock)::int stock FROM order_items oi JOIN orders o ON o.id=oi.order_id LEFT JOIN products p ON p.id=oi.product_id WHERE o.created_at BETWEEN $1 AND $2 AND o.paid_at IS NOT NULL AND o.status NOT IN ('cancelled','refunded') GROUP BY oi.product_id,oi.name,oi.sku ORDER BY units DESC LIMIT 20`, [start, end]),
  ]);
  return { summary: summary.rows[0], trend: trend.rows.map(({ bucket_date, ...row }) => ({ ...row, day: bucket_date })), best: best.rows };
}
