import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "ثبت‌نام" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen px-4 pb-24 pt-32">
      <div className="mx-auto w-full max-w-md">
        <p className="font-latin text-[10px] font-medium text-gold">JOIN</p>
        <h1 className="mt-2 text-3xl font-extrabold">ساخت حساب نیروانا</h1>
        <p className="mt-3 text-sm leading-7 text-inksoft">
          اطلاعات شما رمزنگاری و در پایگاه داده امن ذخیره می‌شود.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
