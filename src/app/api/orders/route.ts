import { pool } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/security";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getCurrentUser(); if (!user) return jsonError("وارد حساب نشده‌اید", 401);
  const rows = await pool.query(`SELECT o.public_id,o.status,o.total_toman,o.created_at,o.paid_at,p.ref_id,
    COALESCE(json_agg(json_build_object('name',i.name,'qty',i.qty,'unitPrice',i.unit_price,'image',i.image,'slug',i.slug) ORDER BY i.id) FILTER(WHERE i.id IS NOT NULL),'[]') items
    FROM orders o LEFT JOIN order_items i ON i.order_id=o.id LEFT JOIN LATERAL (SELECT ref_id FROM payments WHERE order_id=o.id ORDER BY id DESC LIMIT 1) p ON true
    WHERE o.user_id=$1 GROUP BY o.id,p.ref_id ORDER BY o.created_at DESC LIMIT 50`, [user.id]);
  return jsonOk({ orders: rows.rows.map(o=>({ publicId:o.public_id,status:o.status,totalToman:o.total_toman,createdAt:o.created_at,paidAt:o.paid_at,items:o.items,refId:o.ref_id })) });
}
