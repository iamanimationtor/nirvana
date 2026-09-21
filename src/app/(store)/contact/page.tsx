import { Reveal } from "@/components/Reveal";
import { IconInstagram, IconLeaf, IconTelegram } from "@/components/Icons";
import ContactForm from "./ContactForm";

export const metadata = { title: "تماس با ما" };

const CHANNELS = [
  {
    icon: IconInstagram,
    t: "اینستاگرام",
    v: "@nirvana.3dprint",
    href: "https://instagram.com/nirvana.3dprint",
    ltr: true,
  },
  {
    icon: IconTelegram,
    t: "تلگرام",
    v: "t.me/Nirvana3DPrint",
    href: "https://t.me/Nirvana3DPrint",
    ltr: true,
  },
  {
    icon: IconLeaf,
    t: "باسلام",
    v: "غرفهٔ پرینت سه‌بعدی نیروانا",
    href: "https://basalam.com/nirvanna-3dprint",
    ltr: false,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-x">
        <Reveal>
          <span className="font-latin text-[10px] font-medium text-gold">
            CONTACT
          </span>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            با ما در <span className="text-gold">تماس</span> باش
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-8 text-inksoft">
            سفارش اختصاصی، چاپ طراحی خودت، یا حتی فقط گفت‌وگو دربارهٔ یک ایده —
            اینجاییم. معمولی‌ترین راه‌ها را هم می‌گذاری، اما معمولی جواب نمی‌دهیم.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            {CHANNELS.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.08}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass glass-hover group flex items-center gap-4 rounded-[24px] p-5"
                >
                  <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-forest text-ivory transition-all duration-500 group-hover:scale-110 group-hover:bg-forest group-hover:text-neon dark:bg-neon dark:text-pine">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{c.t}</span>
                    <span
                      dir={c.ltr ? "ltr" : "rtl"}
                      className="mt-1 block text-xs font-bold text-inksoft"
                    >
                      {c.v}
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="rounded-[24px] border border-linec bg-paper/70 p-5 text-xs leading-6 text-inksoft">
                <p className="text-sm font-extrabold text-ink">
                  کارگاه و گالری
                </p>
                <p className="mt-1">تهران، ایران</p>
                <p className="mt-3">
                  پاسخ‌گویی از ساعت ۱۰ صبح تا ۷ عصر، شنبه تا چهارشنبه.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
