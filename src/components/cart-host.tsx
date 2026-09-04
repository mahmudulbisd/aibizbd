"use client";

import { useCart } from "@/components/cart-context";
import { CheckoutDrawer } from "@/components/checkout-drawer";

/** Renders the checkout drawer globally whenever the cart is open. */
export function CartHost() {
  const { item, isOpen, closeCart } = useCart();

  if (!isOpen || !item) return null;

  return (
    <CheckoutDrawer
      item={item}
      onClose={() => {
        closeCart();
      }}
    />
  );
}
