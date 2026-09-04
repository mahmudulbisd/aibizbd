import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/components/auth-context";
import { CartHost } from "@/components/cart-host";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-cyber min-h-full">
        <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden />
        <CartProvider>
          <AuthProvider>
            <Navbar />
            <main className="relative z-10">{children}</main>
            <Footer />
            <CartHost />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
