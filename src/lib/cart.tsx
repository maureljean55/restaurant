"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findDemoDish } from "@/data/demo-dishes";
import { clampQty, itemCount, priceLines, subtotal, type CartLine, type PricedLine } from "@/lib/domain/pricing";

const STORAGE_KEY = "panier-v1";

type CartContext = {
  lines: PricedLine[];
  count: number;
  total: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine => typeof l?.slug === "string" && typeof l?.qty === "number" && !!findDemoDish(l.slug),
    );
  } catch {
    return [];
  }
}

/** Panier conservé dans le navigateur (aucun compte client requis). */
export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lecture différée : le stockage n'existe pas pendant le rendu serveur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRaw(readStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      /* stockage indisponible (navigation privée) : le panier reste en mémoire */
    }
  }, [raw, loaded]);

  const setQty = useCallback((slug: string, qty: number) => {
    const q = clampQty(qty);
    setRaw((prev) => {
      const rest = prev.filter((l) => l.slug !== slug);
      if (q === 0) return rest;
      const existing = prev.findIndex((l) => l.slug === slug);
      const line = { slug, qty: q };
      if (existing === -1) return [...prev, line];
      const next = [...prev];
      next[existing] = line;
      return next;
    });
  }, []);

  const add = useCallback(
    (slug: string, qty = 1) =>
      setRaw((prev) => {
        const current = prev.find((l) => l.slug === slug)?.qty ?? 0;
        const q = clampQty(current + qty);
        return current ? prev.map((l) => (l.slug === slug ? { slug, qty: q } : l)) : [...prev, { slug, qty: q }];
      }),
    [],
  );

  const value = useMemo<CartContext>(() => {
    const lines = priceLines(raw, (slug) => findDemoDish(slug)?.price);
    return {
      lines,
      count: itemCount(lines),
      total: subtotal(lines),
      add,
      setQty,
      remove: (slug) => setQty(slug, 0),
      clear: () => setRaw([]),
    };
  }, [raw, add, setQty]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
