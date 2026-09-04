"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Product } from "@/db/schema";

export interface CartItem {
  slug: string;
  title: string;
  priceBdt: string;
}

interface CartState {
  /** The single product currently in the cart (one-item quick checkout). */
  item: CartItem | null;
  hasItem: boolean;
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "aibizbd.cart";

/** Minimal external store over localStorage for SSR-safe cart hydration. */
function createCartStore() {
  const listeners = new Set<() => void>();
  let cached: CartItem | null = null;
  let loaded = false;

  function read(): CartItem | null {
    if (!loaded) {
      loaded = true;
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          cached = raw ? (JSON.parse(raw) as CartItem) : null;
        } catch {
          cached = null;
        }
      }
    }
    return cached;
  }

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot(): CartItem | null {
      return read();
    },
    set(next: CartItem | null) {
      cached = next;
      try {
        if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore write failures (private mode etc.)
      }
      for (const cb of listeners) cb();
    },
  };
}

// Module-scope singleton store (holds no component state — just the
// localStorage subscription + cached snapshot, so it is safe across renders
// and HMR without violating ref-in-render rules).
const cartStore = createCartStore();

export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = cartStore;

  // SSR-safe: server snapshot is always null; client re-renders after hydration.
  const item = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (product: Product) => {
      store.set({
        slug: product.slug,
        title: product.title,
        priceBdt: String(product.priceBdt),
      });
      setIsOpen(true); // "Buy Now" opens checkout immediately
    },
    [store],
  );

  const removeItem = useCallback(() => store.set(null), [store]);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartState>(
    () => ({
      item,
      hasItem: item !== null,
      isOpen,
      addItem,
      removeItem,
      openCart,
      closeCart,
    }),
    [item, isOpen, addItem, removeItem, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
