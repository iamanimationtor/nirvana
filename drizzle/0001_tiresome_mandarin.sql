UPDATE "orders" SET "payment_status"='paid',"status"='confirmed' WHERE "status"='paid';--> statement-breakpoint
UPDATE "orders" SET "subtotal_toman"="total_toman"+"discount_toman"-"shipping_toman" WHERE "total_toman"<>"subtotal_toman"-"discount_toman"+"shipping_toman";--> statement-breakpoint
UPDATE "inventory_transactions" SET "quantity"="stock_after"-"stock_before" WHERE "stock_after"<>"stock_before"+"quantity";--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "order_events" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "demo_token_used_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_idempotency_unique" ON "inventory_transactions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "order_events_idempotency_unique" ON "order_events" USING btree ("idempotency_key");--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_consistent" CHECK ("inventory_transactions"."stock_after" = "inventory_transactions"."stock_before" + "inventory_transactions"."quantity");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_valid" CHECK ("orders"."status" IN ('pending','confirmed','processing','preparing','shipped','delivered','cancelled','returned','refunded'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_status_valid" CHECK ("orders"."payment_status" IN ('unpaid','pending','paid','failed','refunded','partially_refunded'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_status_valid" CHECK ("orders"."shipping_status" IN ('pending','preparing','shipped','delivered','returned'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_amounts_nonnegative" CHECK ("orders"."total_toman" >= 0 AND "orders"."subtotal_toman" >= 0 AND "orders"."discount_toman" >= 0 AND "orders"."shipping_toman" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_consistent" CHECK ("orders"."total_toman" = "orders"."subtotal_toman" - "orders"."discount_toman" + "orders"."shipping_toman");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount_toman" > 0 AND "payments"."amount_rial" > 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_status_valid" CHECK ("payments"."status" IN ('pending','verified','failed','cancelled','refunded'));