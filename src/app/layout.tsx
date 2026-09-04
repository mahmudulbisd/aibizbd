import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { getI18n } from "@/lib/i18n/server";
import { LocaleProvider } from "@/components/locale-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
});

// Bengali glyph fallback — Latin stays on Plus Jakarta, Bangla falls through here.
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  weight: ["400", "500", "600", "700"],
});

const safeMetadataBase = (() => {
  try {
    return new URL(siteConfig.url);
  } catch {
    return new URL("https://aibizbd.com");
  }
})();

export const metadata: Metadata = {
  metadataBase: safeMetadataBase,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, currency } = await getI18n();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="bg-cyber min-h-full">
        <LocaleProvider initialLocale={locale} initialCurrency={currency}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
