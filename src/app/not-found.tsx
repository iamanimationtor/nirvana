import Link from "next/link";
import { IconArrowLeft, IconLeaf } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
      <span className="glass grid h-20 w-20 place-items-center rounded-full text-gold">
        <IconLeaf className="h-9 w-9" />
      </span>
      <h1 className="mt-8 text-4xl font-extrabold md:text-5xl">
        این صفحه به گالری نرسید
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-7 text-inksoft">
        نشانی‌ای که دنبالش می‌آمدی یا جابه‌جا شده و یا هرگز نبوده — مثل بعضی
        آثار خاص که فقط یک نسخه دارند.
      </p>
      <Link href="/" className="btn btn-primary mt-8 px-8 py-4 text-sm">
        بازگشت به خانه
        <IconArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
