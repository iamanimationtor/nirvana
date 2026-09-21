-- Safe adoption path for databases created by the pre-admin application.
-- Run only through `npm run db:upgrade-legacy` after taking a verified backup.
BEGIN;
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS parent_id integer, ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS sku text, ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS brand text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN IF NOT EXISTS shipping jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN IF NOT EXISTS min_stock integer NOT NULL DEFAULT 5, ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active', ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone, ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now(), ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();
UPDATE products SET sku='LEGACY-'||id WHERE sku IS NULL OR sku='';
ALTER TABLE IF EXISTS products ALTER COLUMN sku SET NOT NULL;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid', ADD COLUMN IF NOT EXISTS shipping_status text NOT NULL DEFAULT 'pending', ADD COLUMN IF NOT EXISTS subtotal_toman integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS discount_toman integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS shipping_toman integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS internal_note text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();
UPDATE orders SET payment_status='paid',status='confirmed' WHERE status='paid';
UPDATE orders SET subtotal_toman=total_toman,discount_toman=0,shipping_toman=0 WHERE subtotal_toman=0 AND total_toman<>0;
ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS variant_id integer, ADD COLUMN IF NOT EXISTS sku text NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"line" text NOT NULL,
	"postal_code" text DEFAULT '' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "admin_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"stock_before" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"admin_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_after_nonnegative" CHECK ("inventory_transactions"."stock_after" >= 0)
);
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"target_url" text,
	"user_id" integer,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "order_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"admin_id" integer,
	"type" text NOT NULL,
	"from_value" text,
	"to_value" text,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"variant_id" integer,
	"slug" text NOT NULL,
	"sku" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"unit_price" integer NOT NULL,
	"qty" integer NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	CONSTRAINT "order_items_qty_positive" CHECK ("order_items"."qty" > 0)
);
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"user_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"shipping_status" text DEFAULT 'pending' NOT NULL,
	"total_toman" integer NOT NULL,
	"subtotal_toman" integer DEFAULT 0 NOT NULL,
	"discount_toman" integer DEFAULT 0 NOT NULL,
	"shipping_toman" integer DEFAULT 0 NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"address_line" text NOT NULL,
	"postal_code" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"provider" text DEFAULT 'zarinpal' NOT NULL,
	"authority" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount_toman" integer NOT NULL,
	"amount_rial" integer NOT NULL,
	"ref_id" text,
	"card_pan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
CREATE TABLE IF NOT EXISTS "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"price" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"old_price" integer,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"category_id" integer NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"short_desc" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"shipping" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 5 NOT NULL,
	"prep_time" text DEFAULT '' NOT NULL,
	"material" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_nonnegative" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_stock_nonnegative" CHECK ("products"."stock" >= 0),
	CONSTRAINT "products_min_stock_nonnegative" CHECK ("products"."min_stock" >= 0),
	CONSTRAINT "products_discount_valid" CHECK ("products"."discount_percent" >= 0 AND "products"."discount_percent" <= 100)
);
CREATE TABLE IF NOT EXISTS "refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"payment_id" integer,
	"amount_toman" integer NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "refund_amount_positive" CHECK ("refunds"."amount_toman" > 0)
);
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"group_name" text DEFAULT 'general' NOT NULL,
	"updated_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"failed_login_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"last_login_ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='addresses_user_id_users_id_fk') THEN ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='admin_activity_logs_admin_id_users_id_fk') THEN ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='admin_sessions_user_id_users_id_fk') THEN ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='inventory_transactions_product_id_products_id_fk') THEN ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='inventory_transactions_variant_id_product_variants_id_fk') THEN ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='inventory_transactions_admin_id_users_id_fk') THEN ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='notifications_user_id_users_id_fk') THEN ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_events_order_id_orders_id_fk') THEN ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_events_admin_id_users_id_fk') THEN ALTER TABLE "order_events" ADD CONSTRAINT "order_events_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_items_order_id_orders_id_fk') THEN ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_items_product_id_products_id_fk') THEN ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='order_items_variant_id_product_variants_id_fk') THEN ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orders_user_id_users_id_fk') THEN ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='password_reset_tokens_user_id_users_id_fk') THEN ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payments_order_id_orders_id_fk') THEN ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='product_images_product_id_products_id_fk') THEN ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='product_variants_product_id_products_id_fk') THEN ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='products_category_id_categories_id_fk') THEN ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='refunds_order_id_orders_id_fk') THEN ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='refunds_payment_id_payments_id_fk') THEN ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='refunds_admin_id_users_id_fk') THEN ALTER TABLE "refunds" ADD CONSTRAINT "refunds_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='role_permissions_role_id_roles_id_fk') THEN ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='role_permissions_permission_id_permissions_id_fk') THEN ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sessions_user_id_users_id_fk') THEN ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='settings_updated_by_users_id_fk') THEN ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_roles_user_id_users_id_fk') THEN ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_roles_role_id_roles_id_fk') THEN ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action; END IF; END $do$;
CREATE INDEX IF NOT EXISTS "addresses_user_id_idx" ON "addresses" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "activity_admin_idx" ON "admin_activity_logs" USING btree ("admin_id");
CREATE INDEX IF NOT EXISTS "activity_action_idx" ON "admin_activity_logs" USING btree ("action");
CREATE INDEX IF NOT EXISTS "activity_created_idx" ON "admin_activity_logs" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_sessions_token_unique" ON "admin_sessions" USING btree ("token_hash");
CREATE INDEX IF NOT EXISTS "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_idx" ON "admin_sessions" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "inventory_product_idx" ON "inventory_transactions" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "inventory_created_idx" ON "inventory_transactions" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");
CREATE INDEX IF NOT EXISTS "notifications_created_idx" ON "notifications" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "order_events_order_idx" ON "order_events" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "order_events_created_idx" ON "order_events" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_idx" ON "order_items" USING btree ("product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_public_id_unique" ON "orders" USING btree ("public_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");
CREATE INDEX IF NOT EXISTS "orders_created_idx" ON "orders" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders" USING btree ("payment_status");
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_token_unique" ON "password_reset_tokens" USING btree ("token_hash");
CREATE INDEX IF NOT EXISTS "password_reset_user_idx" ON "password_reset_tokens" USING btree ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_authority_unique" ON "payments" USING btree ("authority");
CREATE INDEX IF NOT EXISTS "payments_order_id_idx" ON "payments" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" USING btree ("status");
CREATE INDEX IF NOT EXISTS "product_images_product_idx" ON "product_images" USING btree ("product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_unique" ON "product_variants" USING btree ("sku");
CREATE INDEX IF NOT EXISTS "product_variants_product_idx" ON "product_variants" USING btree ("product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_unique" ON "products" USING btree ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_unique" ON "products" USING btree ("sku");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" USING btree ("category_id");
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products" USING btree ("status");
CREATE INDEX IF NOT EXISTS "products_stock_idx" ON "products" USING btree ("stock");
CREATE INDEX IF NOT EXISTS "products_created_idx" ON "products" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "refunds_order_idx" ON "refunds" USING btree ("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_unique" ON "role_permissions" USING btree ("role_id","permission_id");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_expires_idx" ON "sessions" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "settings_group_idx" ON "settings" USING btree ("group_name");
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_unique" ON "user_roles" USING btree ("user_id","role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");
COMMIT;
