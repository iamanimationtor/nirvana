import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="admin-login-title">
        <Link className="admin-auth-back" href="/">
          <AdminIcon name="arrow" />
          بازگشت به فروشگاه
        </Link>
        <div className="admin-auth-mark" aria-hidden="true"><AdminIcon name="shield" /></div>
        <h1 id="admin-login-title">ورود به مدیریت</h1>
        <p>برای ادامه، اطلاعات حساب مدیریتی خود را وارد کنید. دسترسی‌ها بر اساس نقش شما کنترل می‌شوند.</p>
        <AdminLoginForm />
        <p className="admin-auth-footnote"><Link className="admin-auth-link" href="/admin/forgot-password">رمز عبور را فراموش کرده‌اید؟</Link></p>
        <p className="admin-auth-footnote">نشست مدیریت پس از ۸ ساعت به‌صورت خودکار پایان می‌یابد.</p>
      </section>
    </main>
  );
}
