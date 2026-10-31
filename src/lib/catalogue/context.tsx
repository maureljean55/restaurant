"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Catalogue, Dish } from "./types";

type Value = Catalogue & { findDish: (slug: string) => Dish | undefined };
const Ctx = createContext<Value | null>(null);

/** Met la carte et les infos du restaurant (lues côté serveur) à disposition des composants du navigateur. */
export function CatalogueProvider({ catalogue, children }: { catalogue: Catalogue; children: ReactNode }) {
  const value = useMemo(() => {
    const bySlug = new Map(catalogue.dishes.map((d) => [d.slug, d]));
    return { ...catalogue, findDish: (slug: string) => bySlug.get(slug) };
  }, [catalogue]);
  return <Ctx value={value}>{children}</Ctx>;
}

export function useCatalogue(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCatalogue doit être utilisé dans <CatalogueProvider>");
  return v;
}
