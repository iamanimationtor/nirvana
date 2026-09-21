"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AdminUser, Permission } from "@/lib/admin-auth";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { AdminLogout } from "./AdminLogout";

type NavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  permission: Permission;
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "نمای کلی",
    items: [{ href: "/admin", label: "داشبورد", icon: "dashboard", permission: "dashboard.view" }],
  },
  {
    label: "فروشگاه",
    items: [
      { href: "/admin/products", label: "محصولات", icon: "cube", permission: "products.view" },
      { href: "/admin/products/new", label: "افزودن محصول", icon: "plus", permission: "products.create" },
      { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "box", permission: "products.view" },
      { href: "/admin/inventory", label: "انبار", icon: "inventory", permission: "inventory.view" },
      { href: "/admin/orders", label: "سفارش‌ها", icon: "orders", permission: "orders.view" },
      { href: "/admin/customers", label: "مشتریان", icon: "users", permission: "customers.view" },
    ],
  },
  {
    label: "گزارش‌ها",
    items: [
      { href: "/admin/analytics", label: "تحلیل فروش", icon: "chart", permission: "reports.view" },
      { href: "/admin/reports", label: "گزارش مالی", icon: "document", permission: "reports.view" },
      { href: "/admin/best-sellers", label: "پرفروش‌ها", icon: "trend", permission: "reports.view" },
    ],
  },
  {
    label: "مدیریت",
    items: [
      { href: "/admin/notifications", label: "اعلان‌ها", icon: "notification", permission: "notifications.view" },
      { href: "/admin/users", label: "مدیران و نقش‌ها", icon: "shield", permission: "users.view" },
      { href: "/admin/activity", label: "گزارش فعالیت", icon: "activity", permission: "activity.view" },
      { href: "/admin/settings", label: "تنظیمات", icon: "settings", permission: "settings.manage" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  super_admin: "مدیر ارشد",
  admin: "مدیر",
  manager: "مدیر فروشگاه",
  inventory_manager: "مسئول انبار",
  order_manager: "مسئول سفارش",
  support: "پشتیبانی",
};

export function AdminShell({ admin, children }: { admin: AdminUser; children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleGroups = useMemo(
    () => groups.map((group) => ({ ...group, items: group.items.filter((item) => admin.permissions.includes(item.permission)) })).filter((group) => group.items.length > 0),
    [admin.permissions]
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const current = visibleGroups.flatMap((group) => group.items).find((item) => isActive(pathname, item.href));

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="ناوبری مدیریت">
        <div className="admin-sidebar-inner">
          <div className="admin-brand-row">
            <Link className="admin-brand" href="/admin" aria-label="داشبورد مدیریت نیروانا">
              <span className="admin-logo" aria-hidden="true"><span>ن</span></span>
              <span>
                <strong>نیروانا</strong>
                <small>کنسول مدیریت</small>
              </span>
            </Link>
            <button className="admin-sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="بستن منو">
              <AdminIcon name="close" />
            </button>
          </div>

          <nav className="admin-nav">
            {visibleGroups.map((group) => (
              <div className="admin-nav-group" key={group.label}>
                <p className="admin-nav-label">{group.label}</p>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link className={`admin-nav-link ${active ? "is-active" : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined}>
                      <AdminIcon name={item.icon} className="admin-nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-bottom">
            <Link className="admin-store-link" href="/" target="_blank">
              <span className="admin-store-link-icon"><AdminIcon name="store" /></span>
              <span>مشاهده فروشگاه<small>باز کردن در پنجره جدید</small></span>
              <AdminIcon name="external" />
            </Link>
            <div className="admin-sidebar-user">
              <span className="admin-avatar" aria-hidden="true">{initials(admin.name)}</span>
              <span className="admin-user-copy"><strong>{admin.name}</strong><small>{roleLabels[admin.role] ?? admin.role}</small></span>
              <AdminLogout compact />
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && <button className="admin-nav-backdrop" type="button" aria-label="بستن منو" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-start">
            <button className="admin-menu-toggle" type="button" onClick={() => setMenuOpen(true)} aria-label="باز کردن منو" aria-expanded={menuOpen}>
              <AdminIcon name="menu" />
            </button>
            <div className="admin-header-context">
              <span>مدیریت فروشگاه</span>
              <strong>{current?.label ?? "پنل مدیریت"}</strong>
            </div>
          </div>
          <div className="admin-header-actions">
            <Link className="admin-header-store" href="/" target="_blank" title="مشاهده فروشگاه">
              <AdminIcon name="external" />
              <span>فروشگاه</span>
            </Link>
            <Link className="admin-account-link" href="/admin/change-password">
              <span className="admin-avatar">{initials(admin.name)}</span>
              <span className="admin-account-copy"><strong>{admin.name}</strong><small>{roleLabels[admin.role] ?? admin.role}</small></span>
              <AdminIcon name="chevron" />
            </Link>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  if (href === "/admin/products" && pathname === "/admin/products/new") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  return name.trim().slice(0, 1) || "ن";
}
