import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/components/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartHost } from "@/components/cart-host";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden />
      <CartProvider>
        <AuthProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <CartHost />
        </AuthProvider>
      </CartProvider>
    </>
  );
}
