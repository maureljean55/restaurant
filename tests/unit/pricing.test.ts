import { describe, expect, it } from "vitest";
import { clampQty, itemCount, MAX_QTY_PER_LINE, priceLines, subtotal } from "@/lib/domain/pricing";

const prix: Record<string, number | null> = { alloco: 2500, kedjenou: 8000, sansprix: null };
const priceOf = (slug: string) => prix[slug];

describe("calcul du panier", () => {
  it("calcule les lignes et le sous-total", () => {
    const lines = priceLines(
      [
        { slug: "alloco", qty: 2 },
        { slug: "kedjenou", qty: 1 },
      ],
      priceOf,
    );
    expect(lines.map((l) => l.lineTotal)).toEqual([5000, 8000]);
    expect(subtotal(lines)).toBe(13000);
    expect(itemCount(lines)).toBe(3);
  });

  it("ignore les plats inconnus, sans prix ou en quantité nulle", () => {
    const lines = priceLines(
      [
        { slug: "inconnu", qty: 1 },
        { slug: "sansprix", qty: 1 },
        { slug: "alloco", qty: 0 },
      ],
      priceOf,
    );
    expect(lines).toEqual([]);
    expect(subtotal(lines)).toBe(0);
  });

  it("borne les quantités (négatives, décimales, excessives, invalides)", () => {
    expect(clampQty(-3)).toBe(0);
    expect(clampQty(2.7)).toBe(2);
    expect(clampQty(999)).toBe(MAX_QTY_PER_LINE);
    expect(clampQty(Number.NaN)).toBe(0);
  });

  it("ne fait pas confiance à une quantité excessive envoyée par le navigateur", () => {
    const [ligne] = priceLines([{ slug: "alloco", qty: 1000 }], priceOf);
    expect(ligne.qty).toBe(MAX_QTY_PER_LINE);
    expect(ligne.lineTotal).toBe(2500 * MAX_QTY_PER_LINE);
  });
});
