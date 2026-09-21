import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { getStoreSettings } from "@/lib/store-settings";
import { siteUrl } from "@/lib/site-url";

// Store settings are loaded from PostgreSQL. Rendering on request keeps the
// build independent from the production database and lets the safe defaults
// render while a database is not configured.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const name = String(settings["store.name"]);
  const title = String(settings["seo.defaultTitle"]);
  const description = String(settings["seo.defaultDescription"]);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${name}` },
    description,
    openGraph: { title, description, siteName: name, locale: "fa_IR", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#F7F2E7",
  width: "device-width",
  initialScale: 1,
};

const themeInit = `(function(){try{var t=localStorage.getItem("nirvana-theme");if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" style={{ "--font-vazir": "'Vazirmatn Variable'", "--font-grotesk": "'Space Grotesk Variable'" } as React.CSSProperties}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
