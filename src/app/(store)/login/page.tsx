import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <div className="min-h-screen px-4 pb-24 pt-32">
      <div className="mx-auto w-full max-w-md">
        <p className="font-latin text-[10px] font-medium text-gold">ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-extrabold">ورود به حساب</h1>
        <p className="mt-3 text-sm leading-7 text-inksoft">
          برای پیگیری سفارش‌ها و پرداخت امن وارد شوید.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
