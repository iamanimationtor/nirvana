import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ForgotForm } from "@/components/admin/PasswordResetForms";

export default function ForgotPasswordPage() {
  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="forgot-password-title">
        <Link className="admin-auth-back" href="/admin/login"><AdminIcon name="arrow" />بازگشت به ورود</Link>
        <div className="admin-auth-mark" aria-hidden="true"><AdminIcon name="lock" /></div>
        <h1 id="forgot-password-title">بازیابی رمز عبور</h1>
        <p>اگر ایمیل یک حساب مدیریتی فعال باشد، پیوند بازیابی امن با اعتبار ۳۰ دقیقه‌ای ارسال می‌شود.</p>
        <ForgotForm />
      </section>
    </main>
  );
}
