import { Suspense } from "react";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ResetForm } from "@/components/admin/PasswordResetForms";

export default function ResetPasswordPage() {
  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="reset-password-title">
        <Link className="admin-auth-back" href="/admin/login"><AdminIcon name="arrow" />بازگشت به ورود</Link>
        <div className="admin-auth-mark" aria-hidden="true"><AdminIcon name="shield" /></div>
        <h1 id="reset-password-title">انتخاب رمز جدید</h1>
        <p>رمزی با حداقل ۸ کاراکتر و ترکیبی از حرف و عدد انتخاب کنید.</p>
        <Suspense fallback={<div className="admin-skeleton" aria-label="در حال آماده‌سازی فرم" />}><ResetForm /></Suspense>
      </section>
    </main>
  );
}
