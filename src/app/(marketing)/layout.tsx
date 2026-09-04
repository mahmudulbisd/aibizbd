import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/components/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartHost } from "@/components/cart-host";
import { getI18n } from "@/lib/i18n/server";

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { dict } = await getI18n();

  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden />
      <CartProvider>
        <AuthProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer dict={dict} />
          <CartHost />
        </AuthProvider>
      </CartProvider>
    </>
  );
}
