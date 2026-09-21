"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  IconInstagram,
  IconLeaf,
  IconSend,
  IconTelegram,
} from "./Icons";
import { Reveal } from "./Reveal";
import { SEED_CATEGORIES } from "@/lib/seed-data";
import { useStore } from "@/store/store";

const QUICK_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const COPYRIGHT_YEAR = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  timeZone: "Asia/Tehran",
}).format(new Date());

export default function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const subscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        notify("عضویت شما ثبت شد ✓");
        setEmail("");
      } else {
        notify(data.message ?? "ایمیل معتبر نیست");
      }
    } catch {
      notify("خطا در اتصال؛ دوباره تلاش کنید");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-pine pb-28 pt-20 text-ivory md:pb-10">
      {/* top gold hairline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/70 to-transparent"
      />
      {/* leaf watermark */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute -end-20 -top-20 h-80 w-80 rotate-[120deg] text-ivory/[0.04]"
        fill="currentColor"
      >
        <path d="M100 195C42 160 20 110 38 55 88 28 148 38 172 88c18 44-14 92-72 107Z" />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 start-[-80px] h-96 w-96 rounded-full bg-neon/10 blur-3xl"
      />

      <div className="container-x relative">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          {/* brand */}
          <Reveal>
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-ivory/20 bg-ivory/5 text-neon">
                  <IconLeaf className="h-6 w-6" />
                </span>
                <div className="leading-none">
                  <p className="text-xl font-extrabold">نیروانا</p>
                  <p className="font-latin mt-1.5 text-[9px] text-ivory/50">
                    NIRVANA 3D
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-7 text-ivory/65">
                هنر سه‌بعدی برای زندگی واقعی. گالری و کارگاه چاپ سه‌بعدی
                نیروانا؛ هر قطعه یک داستان دارد.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  {
                    href: "https://instagram.com/nirvana.3dprint",
                    label: "اینستاگرام",
                    icon: IconInstagram,
                  },
                  {
                    href: "https://t.me/Nirvana3DPrint",
                    label: "تلگرام",
                    icon: IconTelegram,
                  },
                  {
                    href: "https://basalam.com/nirvanna-3dprint",
                    label: "باسلام",
                    icon: IconLeaf,
                  },
                ].map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -4, scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-ivory/20 bg-ivory/5 text-ivory/80 backdrop-blur-md transition-all duration-300 hover:border-neon/60 hover:text-neon hover:shadow-[0_0_22px_-4px_rgba(163,245,90,0.5)]"
                  >
                    <s.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* quick links */}
          <Reveal delay={0.08}>
            <div>
              <h3 className="font-latin mb-5 text-[10px] font-medium text-goldsoft">
                QUICK LINKS
              </h3>
              <ul className="flex flex-col gap-3">
                {[...QUICK_LINKS, { href: "/account", label: "حساب کاربری" }].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-2 text-sm font-bold text-ivory/70 transition-colors hover:text-neon"
                    >
                      <span className="h-px w-4 bg-gold/50 transition-all duration-300 group-hover:w-6 group-hover:bg-neon" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* categories */}
          <Reveal delay={0.16}>
            <div>
              <h3 className="font-latin mb-5 text-[10px] font-medium text-goldsoft">
                CATEGORIES
              </h3>
              <ul className="flex flex-col gap-3">
                {SEED_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop?cat=${c.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-bold text-ivory/70 transition-colors hover:text-neon"
                    >
                      <span className="h-px w-4 bg-gold/50 transition-all duration-300 group-hover:w-6 group-hover:bg-neon" />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* newsletter */}
          <Reveal delay={0.24}>
            <div>
              <h3 className="font-latin mb-5 text-[10px] font-medium text-goldsoft">
                NEWSLETTER
              </h3>
              <p className="text-sm font-extrabold">
                از محصولات جدید باخبر شو
              </p>
              <p className="mt-2 text-xs leading-6 text-ivory/55">
                خبر کالکشن‌های تازه و تخفیف‌های گالری، مستقیم در ایمیل تو.
              </p>
              <form onSubmit={subscribe} className="mt-5 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل شما"
                  className="w-full min-w-0 flex-1 rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3 text-sm text-ivory outline-none backdrop-blur-md transition-all duration-300 placeholder:text-ivory/35 focus:border-neon/60 focus:shadow-[0_0_0_4px_rgba(163,245,90,0.12)]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  type="submit"
                  disabled={sending}
                  className="btn shrink-0 bg-neon px-6 py-3 text-sm font-extrabold text-pine shadow-[0_10px_28px_-10px_rgba(163,245,90,0.6)] transition hover:bg-[#b4f977] disabled:opacity-60"
                >
                  {sending ? "…" : "عضویت"}
                  <IconSend className="h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ivory/10 pt-6 text-[11px] text-ivory/40 md:flex-row">
          <p>© {COPYRIGHT_YEAR} نیروانا ۳دی — تمام حقوق محفوظ است.</p>
          <p className="font-latin text-[9px] tracking-[0.2em] text-ivory/30">
            MADE WITH ART · 3D PRINTED
          </p>
        </div>
      </div>
    </footer>
  );
}
