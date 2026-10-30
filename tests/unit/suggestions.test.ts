import { describe, expect, it } from "vitest";
import { suggestionsFor, type DishForSuggestion } from "@/lib/domain/suggestions";

const plat = (slug: string, category: string, extra: Partial<DishForSuggestion> = {}): DishForSuggestion => ({
  slug,
  category,
  available: true,
  price: 1000,
  popularity: 50,
  ...extra,
});

const carte = [
  plat("poisson", "grillades", { pairsWith: ["banane", "bissap"] }),
  plat("alloco", "accompagnements", { popularity: 90 }),
  plat("banane", "accompagnements", { popularity: 60 }),
  plat("frites", "accompagnements", { popularity: 70 }),
  plat("bissap", "boissons", { popularity: 40 }),
  plat("gingembre", "boissons", { popularity: 80 }),
  plat("epuise", "boissons", { available: false, popularity: 99 }),
  plat("sansprix", "boissons", { price: null, popularity: 98 }),
];
const slugs = (g: { items: DishForSuggestion[] }[]) => g.map((x) => x.items.map((i) => i.slug));

describe("suggestions après ajout au panier", () => {
  it("propose d'abord les associations du restaurant, puis les plus populaires", () => {
    expect(slugs(suggestionsFor(carte[0], carte, new Set()))).toEqual([
      ["banane", "alloco"],
      ["bissap", "gingembre"],
    ]);
  });

  it("ignore ce qui est déjà dans le panier, indisponible ou sans prix", () => {
    const groupes = suggestionsFor(carte[0], carte, new Set(["banane", "bissap"]));
    expect(slugs(groupes)).toEqual([["alloco", "frites"], ["gingembre"]]);
    expect(groupes.flatMap((g) => g.items).some((d) => d.slug === "epuise" || d.slug === "sansprix")).toBe(false);
  });

  it("ne propose pas d'accompagnement quand on ajoute un accompagnement", () => {
    expect(suggestionsFor(carte[1], carte, new Set()).map((g) => g.id)).toEqual(["boissons"]);
  });

  it("ne propose rien quand on ajoute une boisson", () => {
    expect(suggestionsFor(carte[4], carte, new Set())).toEqual([]);
  });

  it("ne renvoie pas de groupe vide", () => {
    const toutDansLePanier = new Set(["alloco", "banane", "frites", "bissap", "gingembre"]);
    expect(suggestionsFor(carte[0], carte, toutDansLePanier)).toEqual([]);
  });
});
