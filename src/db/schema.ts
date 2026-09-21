import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default(""),
  blurb: text("blurb").notNull().default(""),
  sort: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    nameEn: text("name_en").notNull().default(""),
    price: integer("price").notNull(),
    oldPrice: integer("old_price"),
    discountPercent: integer("discount_percent").notNull().default(0),
    categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
    brand: text("brand").notNull().default(""),
    shortDesc: text("short_desc").notNull().default(""),
    description: text("description").notNull().default(""),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    variants: jsonb("variants").$type<string[]>().notNull().default([]),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    specifications: jsonb("specifications").$type<Record<string, string>>().notNull().default({}),
    shipping: jsonb("shipping").$type<Record<string, string | number | boolean>>().notNull().default({}),
    stock: integer("stock").notNull().default(0),
    minStock: integer("min_stock").notNull().default(5),
    prepTime: text("prep_time").notNull().default(""),
    material: text("material").notNull().default(""),
    status: text("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_unique").on(t.slug),
    uniqueIndex("products_sku_unique").on(t.sku),
    index("products_category_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
    index("products_stock_idx").on(t.stock),
    index("products_created_idx").on(t.createdAt),
    check("products_price_nonnegative", sql`${t.price} >= 0`),
    check("products_stock_nonnegative", sql`${t.stock} >= 0`),
    check("products_min_stock_nonnegative", sql`${t.minStock} >= 0`),
    check("products_discount_valid", sql`${t.discountPercent} >= 0 AND ${t.discountPercent} <= 100`),
  ]
);

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  sort: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("product_images_product_idx").on(t.productId)]);

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  price: integer("price"),
  stock: integer("stock").notNull().default(0),
  attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (t) => [uniqueIndex("product_variants_sku_unique").on(t.sku), index("product_variants_product_idx").on(t.productId)]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone"),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"),
  status: text("status").notNull().default("active"),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIpHash: text("last_login_ip_hash"),
  ...timestamps,
}, (t) => [uniqueIndex("users_email_unique").on(t.email), index("users_phone_idx").on(t.phone), index("users_role_idx").on(t.role)]);

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("sessions_token_hash_unique").on(t.tokenHash), index("sessions_user_id_idx").on(t.userId), index("sessions_expires_idx").on(t.expiresAt)]);

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("admin_sessions_token_unique").on(t.tokenHash), index("admin_sessions_user_idx").on(t.userId), index("admin_sessions_expires_idx").on(t.expiresAt)]);

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  system: boolean("system").notNull().default(false),
  ...timestamps,
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description").notNull().default(""),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [uniqueIndex("role_permissions_unique").on(t.roleId, t.permissionId)]);

export const userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (t) => [uniqueIndex("user_roles_unique").on(t.userId, t.roleId)]);

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(), phone: text("phone").notNull(), province: text("province").notNull(), city: text("city").notNull(), line: text("line").notNull(), postalCode: text("postal_code").notNull().default(""), isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("addresses_user_id_idx").on(t.userId)]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(), publicId: text("public_id").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"), paymentStatus: text("payment_status").notNull().default("unpaid"), shippingStatus: text("shipping_status").notNull().default("pending"),
  totalToman: integer("total_toman").notNull(), subtotalToman: integer("subtotal_toman").notNull().default(0), discountToman: integer("discount_toman").notNull().default(0), shippingToman: integer("shipping_toman").notNull().default(0),
  customerName: text("customer_name").notNull(), customerEmail: text("customer_email").notNull(), customerPhone: text("customer_phone").notNull(), province: text("province").notNull(), city: text("city").notNull(), addressLine: text("address_line").notNull(), postalCode: text("postal_code").notNull().default(""), note: text("note").notNull().default(""), internalNote: text("internal_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(), paidAt: timestamp("paid_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("orders_public_id_unique").on(t.publicId), index("orders_user_id_idx").on(t.userId), index("orders_status_idx").on(t.status), index("orders_created_idx").on(t.createdAt), index("orders_payment_status_idx").on(t.paymentStatus),
  check("orders_status_valid", sql`${t.status} IN ('pending','confirmed','processing','preparing','shipped','delivered','cancelled','returned','refunded')`),
  check("orders_payment_status_valid", sql`${t.paymentStatus} IN ('unpaid','pending','paid','failed','refunded','partially_refunded')`),
  check("orders_shipping_status_valid", sql`${t.shippingStatus} IN ('pending','preparing','shipped','delivered','returned')`),
  check("orders_amounts_nonnegative", sql`${t.totalToman} >= 0 AND ${t.subtotalToman} >= 0 AND ${t.discountToman} >= 0 AND ${t.shippingToman} >= 0`),
  check("orders_total_consistent", sql`${t.totalToman} = ${t.subtotalToman} - ${t.discountToman} + ${t.shippingToman}`),
]);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(), orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }), productId: integer("product_id").references(() => products.id, { onDelete: "set null" }), variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }), slug: text("slug").notNull(), sku: text("sku").notNull().default(""), name: text("name").notNull(), unitPrice: integer("unit_price").notNull(), qty: integer("qty").notNull(), image: text("image").notNull().default(""),
}, (t) => [index("order_items_order_id_idx").on(t.orderId), index("order_items_product_idx").on(t.productId), check("order_items_qty_positive", sql`${t.qty} > 0`)]);

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(), orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }), adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }), type: text("type").notNull(), fromValue: text("from_value"), toValue: text("to_value"), note: text("note").notNull().default(""), idempotencyKey: text("idempotency_key"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("order_events_order_idx").on(t.orderId), index("order_events_created_idx").on(t.createdAt), uniqueIndex("order_events_idempotency_unique").on(t.idempotencyKey)]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(), orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }), provider: text("provider").notNull().default("zarinpal"), authority: text("authority").notNull(), status: text("status").notNull().default("pending"), amountToman: integer("amount_toman").notNull(), amountRial: integer("amount_rial").notNull(), refId: text("ref_id"), cardPan: text("card_pan"), demoTokenUsedAt: timestamp("demo_token_used_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), verifiedAt: timestamp("verified_at", { withTimezone: true }),
}, (t) => [uniqueIndex("payments_authority_unique").on(t.authority), index("payments_order_id_idx").on(t.orderId), index("payments_status_idx").on(t.status), check("payments_amount_positive", sql`${t.amountToman} > 0 AND ${t.amountRial} > 0`),check("payments_status_valid",sql`${t.status} IN ('pending','verified','failed','cancelled','refunded')`)]);

export const refunds = pgTable("refunds", {
  id: serial("id").primaryKey(), orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }), paymentId: integer("payment_id").references(() => payments.id, { onDelete: "set null" }), amountToman: integer("amount_toman").notNull(), reason: text("reason").notNull().default(""), status: text("status").notNull().default("pending"), adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), processedAt: timestamp("processed_at", { withTimezone: true }),
}, (t) => [index("refunds_order_idx").on(t.orderId), check("refund_amount_positive", sql`${t.amountToman} > 0`)]);

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(), productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }), variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }), type: text("type").notNull(), quantity: integer("quantity").notNull(), before: integer("stock_before").notNull(), after: integer("stock_after").notNull(), reason: text("reason").notNull().default(""), referenceType: text("reference_type"), referenceId: text("reference_id"), idempotencyKey: text("idempotency_key"), adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("inventory_product_idx").on(t.productId), index("inventory_created_idx").on(t.createdAt), uniqueIndex("inventory_idempotency_unique").on(t.idempotencyKey), check("inventory_after_nonnegative", sql`${t.after} >= 0`), check("inventory_consistent", sql`${t.after} = ${t.before} + ${t.quantity}`)]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(), type: text("type").notNull(), title: text("title").notNull(), body: text("body").notNull().default(""), targetUrl: text("target_url"), userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), readAt: timestamp("read_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("notifications_user_read_idx").on(t.userId, t.readAt), index("notifications_created_idx").on(t.createdAt)]);

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(), adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }), action: text("action").notNull(), targetType: text("target_type").notNull(), targetId: text("target_id"), metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}), ipHash: text("ip_hash"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("activity_admin_idx").on(t.adminId), index("activity_action_idx").on(t.action), index("activity_created_idx").on(t.createdAt)]);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(), value: jsonb("value").$type<unknown>().notNull(), group: text("group_name").notNull().default("general"), updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("settings_group_idx").on(t.group)]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(), userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), tokenHash: text("token_hash").notNull(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), usedAt: timestamp("used_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("password_reset_token_unique").on(t.tokenHash), index("password_reset_user_idx").on(t.userId)]);

export const subscribers = pgTable("subscribers", { id: serial("id").primaryKey(), email: text("email").notNull().unique(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
export const messages = pgTable("messages", { id: serial("id").primaryKey(), name: text("name").notNull(), contact: text("contact").notNull().default(""), body: text("body").notNull(), ipHash: text("ip_hash"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
