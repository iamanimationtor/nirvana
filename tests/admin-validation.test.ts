import test from "node:test";
import assert from "node:assert/strict";
import { inventoryAdjustmentSchema, orderUpdateSchema, productAdminSchema } from "../src/lib/admin-validation";
import { adminPasswordSchema, checkoutSchema } from "../src/lib/validation";

const valid = {
  name: "محصول تست", nameEn: "", sku: "TEST-1", slug: "test-1", categoryId: 1,
  price: 1000, oldPrice: null, discountPercent: 0, stock: 4, minStock: 2,
  status: "active", featured: false, brand: "", shortDesc: "", description: "", material: "", prepTime: "",
  images: [], tags: [], features: [], variants: [], seoTitle: "", seoDescription: "", specifications: {}, shipping: {},
};

test("valid product accepted", () => assert.equal(productAdminSchema.safeParse(valid).success, true));
test("negative product price rejected", () => assert.equal(productAdminSchema.safeParse({ ...valid, price: -1 }).success, false));
test("negative stock rejected", () => assert.equal(productAdminSchema.safeParse({ ...valid, stock: -1 }).success, false));
test("unsafe product slug rejected", () => assert.equal(productAdminSchema.safeParse({ ...valid, slug: "../../x" }).success, false));
test("external product image URL rejected", () => assert.equal(productAdminSchema.safeParse({ ...valid, images: ["https://untrusted.example/image.webp"] }).success, false));
test("zero inventory adjustment rejected", () => assert.equal(inventoryAdjustmentSchema.safeParse({ productId: 1, quantity: 0, reason: "test reason" }).success, false));
test("unsupported order status rejected", () => assert.equal(orderUpdateSchema.safeParse({ status: "hacked" }).success, false));
test("privileged passwords require 12+ characters, a letter, and a digit", () => {
  assert.equal(adminPasswordSchema.safeParse("Admin123").success, false);
  assert.equal(adminPasswordSchema.safeParse("AdminPass9").success, false);
  assert.equal(adminPasswordSchema.safeParse("AdminPassword123").success, true);
});

const checkoutCustomer = { name: "مشتری تست", email: "customer@example.com", phone: "09121234567", province: "تهران", city: "تهران", address: "تهران، نشانی آزمون", postalCode: "1234567890" };

test("checkout rejects duplicate product lines before creating an order", () => {
  const result = checkoutSchema.safeParse({ items: [{ id: 1, qty: 1 }, { id: 1, qty: 1 }], customer: checkoutCustomer });
  assert.equal(result.success, false);
});

test("checkout enforces the shared per-product quantity cap", () => {
  const result = checkoutSchema.safeParse({ items: [{ id: 1, qty: 21 }], customer: checkoutCustomer });
  assert.equal(result.success, false);
});
