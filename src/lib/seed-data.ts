import type { Category, InstaPost, Product } from "./types";

/**
 * ─────────────────────────────────────────────────────────────
 *  کاتالوگ نیروانا ۳دی
 *  این فایل منبع دادهٔ فروشگاه است. نام‌ها، قیمت‌ها، توضیحات
 *  و تصاویر را از اینجا ویرایش کنید تا در کل سایت اعمال شود.
 *  (منشأ برند: غرفهٔ «پرینت سه بعدی نیروانا» در باسلام —
 *   Nirvana Art Gallery، تهران)
 * ─────────────────────────────────────────────────────────────
 */

export const SEED_CATEGORIES: (Omit<Category, "id">)[] = [
  { slug: "figures", name: "فیگورها", icon: "figure", blurb: "آثار قابلی نمایش برای دنیای گیم و فانتزی", sort: 1 },
  { slug: "decor", name: "دکور منزل", icon: "vase", blurb: "جزئیاتی که فضا را زنده می‌کند", sort: 2 },
  { slug: "lighting", name: "چراغ و نورپردازی", icon: "lamp", blurb: "نور، با فرم", sort: 3 },
  { slug: "accessories", name: "اکسسوری", icon: "stand", blurb: "لوازم روزمره، با سبک", sort: 4 },
  { slug: "gaming", name: "گیم و تکنولوژی", icon: "gamepad", blurb: "تجهیزات رگال، از دل سه‌بعدی", sort: 5 },
  { slug: "special", name: "محصولات خاص", icon: "spark", blurb: "قطعاتی که دیگران ندیده‌اند", sort: 6 },
];

type SeedProduct = Omit<Product, "id" | "categoryId" | "categorySlug" | "categoryName"> & {
  category: string;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "wave-vase",
    name: "گلدان ارگانیک «موج»",
    nameEn: "WAVE VASE",
    price: 685000,
    oldPrice: 820000,
    category: "decor",
    shortDesc: "گلدان ارگانیک با خطوط نرم و پیوسته که مثل موج‌های آرام، فضا را زنده می‌کند.",
    description:
      "«موج» یکی از محبوب‌ترین آثار نیروانا است؛ فرم ارگانیک آن در صدها لایه چاپ می‌شود و با دقت بالا روی هم می‌نشیند. این گلدان بدون آستر هم مقاوم است و هم سبک؛ انتخابی که هم با گل طبیعی و هم با سبزه و گیاهان کوچک، جلوهٔ کاملی دارد.",
    features: [
      "چاپ سه‌بعدی لایه‌به‌لایه با دقت ۰٫۱۲ میلی‌متر",
      "بدون نیاز به آستر؛ مقاوم و سبک",
      "متریال PLA سازگار با محیط‌زیست",
      "ابعاد تقریبی: ۲۲ × ۲ سانتی‌متر",
    ],
    variants: ["سبز زیتونی", "مشکی", "کرم"],
    images: ["/images/product-vase.jpg", "/images/lifestyle.jpg", "/images/hero.jpg"],
    stock: 8,
    prepTime: "۲ تا ۴ روز کاری",
    material: "PLA",
    featured: true,
  },
  {
    slug: "parametric-lamp",
    name: "چراغ میزی پارامتریک «نور»",
    nameEn: "PARAMETRIC LAMP",
    price: 1290000,
    oldPrice: null,
    category: "lighting",
    shortDesc: "نوری که از دل شبکه‌ای از فرم‌های ریاضی بیرون می‌زند؛ یک چراغ، یک اثر.",
    description:
      "«نور» یک ساختار پارامتریک است که ساعت‌ها زمان چاپ می‌خواهد تا به این ظرافت برسد. در شب، نور گرم LED از بین لایه‌های شبکه بیرون می‌زند و سایه‌ای زنده روی دیوار می‌نشیند. یک قطعه برای میز کار، هال یا گوشهٔ مطالعه.",
    features: [
      "ساختار شبکه‌ای پارامتریک",
      "LED ۲۷۰۰K با درایور داخلی",
      "کابل پارچه‌ای ۱٫۵ متری با کلید کشویی",
      "ضخامت لایه ۰٫۲۴ میلی‌متر",
    ],
    variants: ["مشکی با نور گرم", "کرم با نور سرد"],
    images: ["/images/product-lamp.jpg", "/images/collection.jpg", "/images/lifestyle.jpg"],
    stock: 4,
    prepTime: "۴ تا ۶ روز کاری",
    material: "PETG",
    featured: true,
  },
  {
    slug: "geo-planter",
    name: "گلدان ژئومتریک «کوهستان»",
    nameEn: "GEO PLANTER",
    price: 540000,
    oldPrice: null,
    category: "decor",
    shortDesc: "خطوط تیز و زاویه‌دار مثل قله‌های دوردست؛ گلدانی برای گوشه‌های خالی خانه.",
    description:
      "«کوهستان» با الگوریتم تزیلاسیون ساخته شده؛ هر وجه مثل یک قلهٔ جداست و با نور عصر، سایه‌های جذابی می‌اندازد. گلدان دارای زهکشی و سینی پایه است و برای گیاهان کوچک و سبزه مناسب است.",
    features: [
      "طراحی تزیلاسیون سه‌بعدی",
      "زهکشی و سینی پایه",
      "مناسب گیاهان کوچک و سبزه",
      "ابعاد تقریبی: ۱۴ × ۱۴ سانتی‌متر",
    ],
    variants: ["زغالی", "سبز جنگلی"],
    images: ["/images/product-planter.jpg", "/images/lifestyle.jpg", "/images/product-vase.jpg"],
    stock: 12,
    prepTime: "۱ تا ۳ روز کاری",
    material: "PLA",
    featured: false,
  },
  {
    slug: "turbulence-sculpture",
    name: "مجسمهٔ انتزاعی «تلاطم»",
    nameEn: "TURBULENCE",
    price: 1850000,
    oldPrice: 2100000,
    category: "special",
    shortDesc: "یک فرم در حال حرکت، که چاپ سه‌بعدی آن را برای همیشه متوقف کرده است.",
    description:
      "«تلاطم» از جریان سیال الهام گرفته؛ خطوطی که انگار همیشه در حال چرخند. این اثر به‌صورت دست‌ساز در چند لایه چاپ شده و روی ساقهٔ تراورتن قرار می‌گیرد. نسخهٔ محدود، با گواهی اصالت.",
    features: [
      "نسخهٔ محدود: ۱۲ نسخه در سال",
      "چاپ چندلایه با مونتاژ دستی",
      "ساقه از سنگ تراورتن",
      "گواهی اصالت اثر",
    ],
    variants: ["زغالی با طلایی", "تمام مشکی"],
    images: ["/images/product-sculpture.jpg", "/images/collection.jpg", "/images/lifestyle.jpg"],
    stock: 0,
    prepTime: "پیش‌ثبت سفارش",
    material: "ABS",
    featured: true,
  },
  {
    slug: "fluid-stand",
    name: "استند ارگانیک تبلت و موبایل «لغز»",
    nameEn: "FLUID STAND",
    price: 385000,
    oldPrice: null,
    category: "accessories",
    shortDesc: "پشتیبن ارگانیک برای تبلت و موبایل؛ نرم، مینیمال، کاربردی.",
    description:
      "«لغز» برای میز کار و اتاق خواب طراحی شده؛ فرم موجی آن از هر دو طرف قابل استفاده است و پایهٔ ضدریس آن روی هر سطحی ثابت می‌ماند. انتخابی که میز کار را از شلوغی نجات می‌دهد.",
    features: [
      "پشتیبن تبلت تا ۱۲٫۹ اینچ و موبایل",
      "پایهٔ ضدریس",
      "فرم دوطرفه",
      "رنگ کرم استودیویی",
    ],
    variants: ["کرم", "سبز زیتونی"],
    images: ["/images/product-holder.jpg", "/images/lifestyle.jpg", "/images/product-vase.jpg"],
    stock: 15,
    prepTime: "۱ تا ۳ روز کاری",
    material: "PLA",
    featured: true,
  },
  {
    slug: "tessellate-wallart",
    name: "پنل دیواری ریاضی «شبکه»",
    nameEn: "TESSELLATE WALL",
    price: 980000,
    oldPrice: null,
    category: "decor",
    shortDesc: "پنل سه‌بعدی با فرم‌های تکرارشونده که دیوار را به یک اثر تبدیل می‌کند.",
    description:
      "«شبکه» یک پنل ۳۰ در ۳۰ سانتی‌متری با عمق‌های متغیر است؛ نور روز روی آن می‌رقصد و سایه‌هایش ساعت‌به‌ساعت عوض می‌شوند. قابل ترکیب با پنل‌های دیگر برای ساخت دیوار کامل.",
    features: [
      "سایز ۳۰ × ۰ سانتی‌متر",
      "عمق متغیر ۱ تا ۴ سانتی‌متر",
      "قابلیت ترکیب چند پنلی",
      "نصب آسان با پین مخفی",
    ],
    variants: ["سبز جنگلی", "کرم"],
    images: ["/images/product-wallart.jpg", "/images/lifestyle.jpg", "/images/collection.jpg"],
    stock: 6,
    prepTime: "۳ تا ۵ روز کاری",
    material: "PLA",
    featured: true,
  },
  {
    slug: "sentinel-figure",
    name: "فیگور هلمت «نگهبان»",
    nameEn: "SENTINEL",
    price: 720000,
    oldPrice: null,
    category: "gaming",
    shortDesc: "هلمت مهندسی آینده با جزئیاتی که زیر نور سبز نئون برق می‌زند.",
    description:
      "«نگهبان» برای گیمرها و علاقه‌مندان به سبک سایبرپانک طراحی شده؛ روی پایهٔ نمایشگاهی با نورپردازی سبز قرار می‌گیرد و جزئیات زره در هر زاویه، داستان خودش را دارد. مناسب ویترین، رگال گیمینگ یا میز کار.",
    features: [
      "ارتفاع تقریبی ۱۸ سانتی‌متر",
      "پایهٔ نمایشگاهی با نور LED سبز",
      "دروازهٔ هلمت باز می‌شود",
      "مناسب ویترین و رگال گیمینگ",
    ],
    variants: ["سبز و زغالی", "تمام زغالی"],
    images: ["/images/product-figure.jpg", "/images/collection.jpg", "/images/lifestyle.jpg"],
    stock: 3,
    prepTime: "۵ تا ۷ روز کاری",
    material: "Resin",
    featured: true,
  },
];

export const INSTAGRAM_POSTS: InstaPost[] = [
  { src: "/images/hero.jpg", caption: "از استودیو؛ نورپردازی برای محصول جدید", ratio: "aspect-[4/5]" },
  { src: "/images/product-lamp.jpg", caption: "شب‌ها با «نور» فرق می‌کنند", ratio: "aspect-square" },
  { src: "/images/product-vase.jpg", caption: "«موج» بعد از چاپ — ۱۴ ساعت زمان چاپ", ratio: "aspect-[3/4]" },
  { src: "/images/lifestyle.jpg", caption: "یک گوشه از خانهٔ نمونه", ratio: "aspect-[4/5]" },
  { src: "/images/product-figure.jpg", caption: "«نگهبان» پشت ویترین نشست", ratio: "aspect-square" },
  { src: "/images/product-sculpture.jpg", caption: "«تلاطم»؛ نسخهٔ ۷ از ۱۲", ratio: "aspect-[3/4]" },
  { src: "/images/product-planter.jpg", caption: "گلدان «کوهستان» برای گوشهٔ سبز خانه", ratio: "aspect-[4/5]" },
  { src: "/images/collection.jpg", caption: "گالری نیروانا، آمادهٔ بازدید", ratio: "aspect-video" },
  { src: "/images/product-holder.jpg", caption: "روی میز باید آرامش باشد", ratio: "aspect-square" },
  { src: "/images/product-wallart.jpg", caption: "دیوارها هم خسته می‌شوند", ratio: "aspect-[3/4]" },
];

/** فallback products (in case DB is unavailable) */
export function fallbackProducts(): Product[] {
  const catMap = new Map(SEED_CATEGORIES.map((c) => [c.slug, c]));
  return SEED_PRODUCTS.map((p, i) => {
    const c = catMap.get(p.category)!;
    return {
      ...p,
      id: i + 1,
      categoryId: c.sort,
      categorySlug: c.slug,
      categoryName: c.name,
    };
  });
}

export function fallbackCategories(): Category[] {
  return SEED_CATEGORIES.map((c, i) => ({ ...c, id: i + 1 }));
}
