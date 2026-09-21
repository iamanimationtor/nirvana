import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { IconBox, IconLeaf, IconShield, IconSpark } from "@/components/Icons";

export const metadata = { title: "درباره ما" };

const VALUES = [
  {
    icon: IconSpark,
    t: "طراحی متفاوت",
    d: "هر اثر از یک ایدهٔ هنری شروع می‌شود، نه از یک قالب تکراری. طراحی‌ها اختصاصی‌اند و برای فضای زندگی تو ساخته می‌شوند.",
  },
  {
    icon: IconBox,
    t: "چاپ لایه‌به‌لایه",
    d: "با پرینترهای دقیق فیرمونت و متریال‌های باکیفیت، هر قطعه ساعت‌ها وقت می‌خواهد — و این وقت در جزئیات دیده می‌شود.",
  },
  {
    icon: IconShield,
    t: "اصالت و محدودیت",
    d: "آثار خاص به تعداد محدود چاپ می‌شوند و همراه با گواهی اصالت به دست تو می‌رسند.",
  },
  {
    icon: IconLeaf,
    t: "سبز بودن",
    d: "متریال‌های سازگار با محیط‌زیست و پدربازهای گیاهی؛ گالری‌ای که به زمین فکر می‌کند.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="font-latin text-[10px] font-medium text-gold">
              ABOUT NIRVANA
            </span>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.3] md:text-5xl">
              گالری‌ای که از لایه‌های
              <br />
              چاپ <span className="text-gold">ساخته شده</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-8 text-inksoft">
              نیروانا ۳دی یک گالری و کارگاه چاپ سه‌بعدی در تهران است. ما
              باور داریم اشیای خانگی باید فقط کاربردی نباشند؛ باید قصه بگویند.
              از یک گلدان ارگانیک تا فیگورهای گیمینگ، هر چیزی که در گالری
              می‌بینی، ابتدا یک ایدهٔ هنری است و بعد از صدها لایهٔ چاپ، به شکل
              درمی‌آید.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-8 text-inksoft">
              «نیروانا» به معنای آزادی است؛ آزادی از اشیاء معمولی. ما هر اثر را
              برای آدم‌هایی می‌سازیم که خانهٔ‌شان را موزهٔ کوچکِ خودشان می‌دانند.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://basalam.com/nirvanna-3dprint"
                target="_blank"
                rel="noreferrer"
                className="btn btn-glass glass glass-hover px-6 py-3.5 text-sm"
              >
                غرفهٔ ما در باسلام
              </a>
              <a
                href="https://instagram.com/nirvana.3dprint"
                target="_blank"
                rel="noreferrer"
                className="btn btn-gold px-6 py-3.5 text-sm"
              >
                اینستاگرام گالری
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-4 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_top,rgba(194,161,91,0.2),transparent_60%)] blur-xl"
              />
              <div className="animate-floaty-soft relative aspect-[4/5] overflow-hidden rounded-[38px] shadow-deep">
                <Image
                  src="/images/lifestyle.jpg"
                  alt="فضای کارگاه نیروانا"
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              </div>
              <div className="glass absolute -bottom-6 start-6 rounded-2xl px-5 py-3.5 text-xs font-extrabold">
                تهران · کارگاه و گالری
              </div>
            </div>
          </Reveal>
        </div>

        {/* values */}
        <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08}>
              <div className="group h-full rounded-[26px] border border-linec bg-paper/70 p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-deep">
                <span className="glass glass-hover grid h-14 w-14 place-items-center rounded-2xl text-forest dark:text-neon">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-base font-extrabold">{v.t}</h3>
                <p className="mt-2.5 text-xs leading-6 text-inksoft">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
