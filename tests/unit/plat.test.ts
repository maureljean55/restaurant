import { describe, expect, it } from "vitest";
import { nouveauPlatSchema, slugify, uniqueSlug } from "@/lib/domain/plat";

describe("identifiant d'un nouveau plat", () => {
  it("retire accents, symboles et espaces", () => {
    expect(slugify("Poulet braisé & attiéké")).toBe("poulet-braise-attieke");
    expect(slugify("  Garba (spécial) !! ")).toBe("garba-special");
    expect(slugify("Œufs à la crème")).toBe("oeufs-a-la-creme");
    expect(slugify("***")).toBe("plat");
  });

  it("évite les doublons", () => {
    expect(uniqueSlug("alloco", ["alloco", "alloco-2"])).toBe("alloco-3");
    expect(uniqueSlug("garba", ["alloco"])).toBe("garba");
  });
});

describe("formulaire d'un nouveau plat", () => {
  const base = { name: "Garba", category: "plats" };

  it("accepte un plat minimal et applique les valeurs par défaut", () => {
    const r = nouveauPlatSchema.parse(base);
    expect(r).toMatchObject({ price: null, spice: "doux", prepMinutes: null, badge: null, tags: [], available: true, avec3d: true });
  });

  it("convertit les champs du formulaire", () => {
    const r = nouveauPlatSchema.parse({ ...base, price: "3500", prepMinutes: "", tags: "Thon, Attiéké, , Piment", badge: " " });
    expect(r).toMatchObject({ price: 3500, prepMinutes: null, tags: ["Thon", "Attiéké", "Piment"], badge: null });
  });

  it("refuse un nom vide, un prix invalide ou une catégorie absente", () => {
    expect(nouveauPlatSchema.safeParse({ ...base, name: " " }).success).toBe(false);
    expect(nouveauPlatSchema.safeParse({ ...base, price: "12,5" }).success).toBe(false);
    expect(nouveauPlatSchema.safeParse({ ...base, price: "-1" }).success).toBe(false);
    expect(nouveauPlatSchema.safeParse({ name: "Garba", category: "" }).success).toBe(false);
  });
});
