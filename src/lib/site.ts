export const siteConfig = {
  name: "Ai Biz BD",
  tagline: "Premium AI & Digital Tools — Instant Delivery",
  description:
    "Premium AI tools and digital subscriptions — Gemini Advanced, ChatGPT Plus, Canva Pro, CapCut Pro and more — delivered instantly in Bangladesh. Pay with bKash, Nagad or Binance Pay.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://aibizbd.com",
  contactEmail: "aibizbd@gmail.com",
  supportWhatsApp: "+8801735993166",
  whatsappLink: "https://wa.me/8801735993166",
  location: "Bogra, Rajshahi, Bangladesh",
  timezone: "Asia/Dhaka",
  nav: [
    { label: "Products", href: "/#products" },
    { label: "Track Order", href: "/order" },
    { label: "Support", href: "https://wa.me/8801735993166" },
  ],
  trust: [
    "Instant delivery",
    "bKash · Nagad · Binance Pay",
    "Replacement warranty",
  ],
};

export function formatBDT(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return `৳${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
