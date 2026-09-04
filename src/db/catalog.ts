export type ProviderType = "TELEGRAM_BOT_API" | "LOCAL_STOCK" | "MANUAL";
export type DeliveryType = "LINK" | "CREDENTIALS" | "ACTIVATION_KEY";

export interface CatalogProduct {
  slug: string;
  title: string;
  description: string;
  features: string[];
  priceBdt: string;
  priceUsd: string;
  wholesaleCostUsd: string;
  providerType: ProviderType;
  externalProviderId: string;
  deliveryType: DeliveryType;
  warrantyDays: number;
}

/**
 * Storefront catalog, aligned to the live ProdSeller v1 catalog
 * (verified 2026-09-04 via GET /products). Each product's
 * `externalProviderId` is the real ProdSeller product id used by
 * POST /orders, and `wholesaleCostUsd` is the actual per-unit charge.
 *
 * BDT retail prices follow the Ai Biz BD price list (PRD + knowledge base)
 * and keep ≥40% margin against the USD wholesale cost at ~৳120/$.
 */
export const catalog: CatalogProduct[] = [
  {
    slug: "gemini-pro-18-months",
    title: "Gemini Pro — 18 Months",
    description:
      "Google Gemini Pro (AI Premium) with 5TB storage for 18 months. Activation link delivered to your own Google account — no VPN or card needed.",
    features: [
      "Gemini Advanced / Pro model access",
      "5TB Google storage · 18 months",
      "Activates on your own Google account",
      "No VPN or credit card required",
      "Full-term replacement warranty",
    ],
    priceBdt: "790",
    priceUsd: "6.6",
    wholesaleCostUsd: "1.1",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a31035939dc014325da2c66",
    deliveryType: "LINK",
    warrantyDays: 540,
  },
  {
    slug: "capcut-pro-1-month",
    title: "CapCut Pro — 1 Month",
    description:
      "Full CapCut Pro private team account for 30 days. Every Pro effect, no watermark, 4K export — on up to 2 devices with full warranty.",
    features: [
      "Private Pro team account · 30 days",
      "No-watermark 4K export",
      "Auto-captions & AI tools unlocked",
      "Max 2 devices",
      "Full warranty",
    ],
    priceBdt: "390",
    priceUsd: "3.9",
    wholesaleCostUsd: "1.29",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a2fda51035a6d898f2106fe",
    deliveryType: "CREDENTIALS",
    warrantyDays: 30,
  },
  {
    slug: "capcut-pro-6-months",
    title: "CapCut Pro — 6 Months",
    description:
      "Private CapCut Pro account for 6 months with a 3-month back-free warranty. The most stable CapCut Pro listing.",
    features: [
      "Private account · 6 months",
      "No-watermark 4K export",
      "3-month back-free warranty",
      "Priority support",
    ],
    priceBdt: "1890",
    priceUsd: "18.9",
    wholesaleCostUsd: "9.0",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a7e3ab79c0c1126fff286f0",
    deliveryType: "CREDENTIALS",
    warrantyDays: 180,
  },
  {
    slug: "microsoft-office-365-1-year",
    title: "Microsoft Office 365 Plus — 1 Year",
    description:
      "Office 365 Plus for 1 month + 11 months gift — a full year of Word, Excel, PowerPoint and 1TB OneDrive on your own Microsoft account.",
    features: [
      "Word, Excel, PowerPoint, Outlook",
      "1TB OneDrive storage",
      "1 month + 11 months gift",
      "Activates on your own account",
      "Full warranty",
    ],
    priceBdt: "290",
    priceUsd: "1.75",
    wholesaleCostUsd: "0.29",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a2fe23a1c8697b163aedcbd",
    deliveryType: "CREDENTIALS",
    warrantyDays: 365,
  },
  {
    slug: "canva-pro-2-years",
    title: "Canva Pro — 2 Years (Private)",
    description:
      "Full private Canva Pro account activated in your own email. Every premium template, background remover and brand kit for 2 years.",
    features: [
      "Private account on your own email",
      "All premium templates & tools",
      "Background remover & brand kit",
      "2-year full warranty",
      "Instant delivery",
    ],
    priceBdt: "390",
    priceUsd: "3.0",
    wholesaleCostUsd: "0.5",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a316a7b1777fc2347835653",
    deliveryType: "CREDENTIALS",
    warrantyDays: 730,
  },
  {
    slug: "canva-pro-admin-500-invites",
    title: "Canva Pro — Admin Panel (500 invites)",
    description:
      "Full Canva Pro admin access with 500 invitation slots. Perfect for resellers — invite your own team or clients.",
    features: [
      "Full admin email access",
      "500 invitation slots",
      "Password changeable",
      "Ideal for resellers",
    ],
    priceBdt: "4890",
    priceUsd: "45.0",
    wholesaleCostUsd: "6.5",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a2fdb4f035a6d898f2106ff",
    deliveryType: "CREDENTIALS",
    warrantyDays: 365,
  },
  {
    slug: "netflix-5-profiles-1-month",
    title: "Netflix — 5 Profiles / 4K Full Access",
    description:
      "Full-access Netflix account with 5 profiles and 4 screens for one month. Private and password-changeable.",
    features: [
      "5 profiles · 4 screens",
      "4K streaming",
      "Private account",
      "Password changeable",
      "1-month access",
    ],
    priceBdt: "1290",
    priceUsd: "10.5",
    wholesaleCostUsd: "1.6",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a39262b5ad41876cf5de314",
    deliveryType: "CREDENTIALS",
    warrantyDays: 30,
  },
  {
    slug: "hbo-max-1-month",
    title: "HBO Max — Standard 1 Month",
    description:
      "Private HBO Max standard-plan account for one month. Password changeable, no VPN required.",
    features: [
      "Private account",
      "Password changeable",
      "No VPN required",
      "1-month standard plan",
    ],
    priceBdt: "890",
    priceUsd: "8.4",
    wholesaleCostUsd: "1.4",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a7f7cab969a96358417ffa3",
    deliveryType: "CREDENTIALS",
    warrantyDays: 30,
  },
  {
    slug: "envato-elements-1-month",
    title: "Envato Elements — 1 Month",
    description:
      "30 days of unlimited Envato Elements downloads — templates, stock, fonts and more via a direct web panel.",
    features: [
      "30-day download access",
      "Web panel — direct download",
      "Unlimited daily downloads",
      "Templates, stock & fonts",
    ],
    priceBdt: "1490",
    priceUsd: "11.9",
    wholesaleCostUsd: "1.9",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a949c007980f3141847c0e3",
    deliveryType: "CREDENTIALS",
    warrantyDays: 30,
  },
  {
    slug: "figma-pro-edu-2-years",
    title: "Figma Pro (Edu) — 2 Years",
    description:
      "Figma Professional education plan for 2 years. Very stable accounts with no issues.",
    features: [
      "Figma Pro features",
      "2-year education plan",
      "Very stable accounts",
      "Full design tools unlocked",
    ],
    priceBdt: "3490",
    priceUsd: "27.0",
    wholesaleCostUsd: "4.5",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a7826d9cf6984bb8ba101e8",
    deliveryType: "CREDENTIALS",
    warrantyDays: 730,
  },
  {
    slug: "adobe-express-12-months",
    title: "Adobe Express — 12 Months",
    description:
      "Adobe Express premium for one year. You receive a redeem link — open it, sign in with your email, and you're upgraded.",
    features: [
      "Adobe Express premium",
      "12-month subscription",
      "Redeem-link delivery",
      "Sign in with your own email",
    ],
    priceBdt: "490",
    priceUsd: "4.2",
    wholesaleCostUsd: "0.7",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a5b873847b606c66fc160b2",
    deliveryType: "LINK",
    warrantyDays: 365,
  },
  {
    slug: "miro-edu-lifetime",
    title: "Miro Edu — Lifetime Activation",
    description:
      "Upgrade your Miro account to the education plan for life with an instant activation link.",
    features: [
      "Miro Edu lifetime upgrade",
      "Instant activation link",
      "Use on your own account",
    ],
    priceBdt: "290",
    priceUsd: "1.8",
    wholesaleCostUsd: "0.3",
    providerType: "TELEGRAM_BOT_API",
    externalProviderId: "6a933662a95090fd57e036c5",
    deliveryType: "LINK",
    warrantyDays: 730,
  },
];
