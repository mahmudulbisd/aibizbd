import { ShieldCheck, Timer, Wallet, BadgeCheck } from "lucide-react";
import { getActiveProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { siteConfig } from "@/lib/site";
import { getI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const [products, { dict, currency }] = await Promise.all([
    getActiveProducts(),
    getI18n(),
  ]);

  const heroSub = dict.home.heroSub.replace("{name}", siteConfig.name);

  return (
    <div className="relative">
      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <Reveal>
          <span className="badge-instant inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {dict.home.heroBadge}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            {dict.home.heroTitleA}{" "}
            <span className="text-gradient text-glow-cyan">{dict.home.heroTitleB}</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#8b93a7] sm:text-lg">
            {heroSub}
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[#8b93a7]">
            <span className="flex items-center gap-2">
              <Timer size={16} className="text-cyan-400" /> {dict.home.trustDelivery}
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> {dict.home.trustWarranty}
            </span>
            <span className="flex items-center gap-2">
              <Wallet size={16} className="text-violet-400" /> {dict.home.trustPay}
            </span>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: <CountUp to={5000} suffix="+" />, label: dict.home.statOrders },
              { value: <CountUp to={98} suffix="%" />, label: dict.home.statCustomers },
              { value: <CountUp to={3} suffix="s" />, label: dict.home.statDelivery },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl px-3 py-4">
                <div className="font-display text-2xl font-extrabold text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-[#5b6377]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Catalog ---------- */}
      <section id="products" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                {dict.home.catalogEyebrow}
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                {dict.home.catalogTitle}
              </h2>
            </div>
            <BadgeCheck className="hidden h-8 w-8 text-emerald-400/60 sm:block" />
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i * 60, 300)}>
              <ProductCard product={product} dict={dict} currency={currency} />
            </Reveal>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-[#8b93a7]">{dict.home.catalogEmpty}</p>
        )}
      </section>

      {/* ---------- How it works ---------- */}
      <section className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="font-display text-center text-3xl font-bold">
              {dict.home.howTitle}{" "}
              <span className="text-gradient">{dict.home.howTitleAccent}</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", title: dict.home.step1Title, body: dict.home.step1Body },
              { n: "02", title: dict.home.step2Title, body: dict.home.step2Body },
              { n: "03", title: dict.home.step3Title, body: dict.home.step3Body },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="glass-card glass-card-hover h-full rounded-2xl p-6">
                  <div className="font-mono text-sm text-cyan-400">/{s.n}</div>
                  <h3 className="font-display mt-3 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8b93a7]">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
