import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders, payments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "حساب کاربری" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(40);

  const list = [];
  for (const order of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const pay = await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1);
    list.push({
      publicId: order.publicId,
      status: order.status,
      totalToman: order.totalToman,
      createdAt: order.createdAt.toISOString(),
      items: items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
      refId: pay[0]?.refId ?? null,
    });
  }

  return <AccountClient user={user} orders={list} />;
}
