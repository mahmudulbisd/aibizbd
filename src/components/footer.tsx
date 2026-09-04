import Link from "next/link";
import { Mail, MapPin, MessageCircle, Zap } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm text-center md:text-left">
          <div className="flex items-center justify-center gap-2 font-bold md:justify-start">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600">
              <Zap className="h-3.5 w-3.5 text-white" size={14} />
            </span>
            <span className="font-display">
              Ai<span className="text-gradient">Biz</span> BD
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#8b93a7]">
            Premium AI tools and digital subscriptions, delivered in seconds.
            Pay your way — bKash, Nagad or Binance Pay.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-[#8b93a7] md:items-start">
          <span className="font-semibold uppercase tracking-widest text-[#5b6377] text-xs">
            Contact
          </span>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="flex items-center gap-2 transition hover:text-cyan-300"
          >
            <Mail size={14} /> {siteConfig.contactEmail}
          </a>
          <a
            href={siteConfig.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-cyan-300"
          >
            <MessageCircle size={14} /> {siteConfig.supportWhatsApp}
          </a>
          <span className="flex items-center gap-2">
            <MapPin size={14} /> {siteConfig.location}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-[#8b93a7] md:items-start">
          <span className="font-semibold uppercase tracking-widest text-[#5b6377] text-xs">
            Store
          </span>
          <Link href="/#products" className="transition hover:text-cyan-300">
            All products
          </Link>
          <Link href="/order" className="transition hover:text-cyan-300">
            Track your order
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-[#4a5165]">
        © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.location}
      </p>
    </footer>
  );
}
