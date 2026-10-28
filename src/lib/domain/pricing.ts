/**
 * Calcul des totaux du panier — logique pure, sans accès au navigateur.
 * ⚠️ Côté client, ces montants servent uniquement à l'affichage :
 * le serveur recalculera tout à partir des prix en base au moment de la commande.
 */

export type CartLine = { slug: string; qty: number };
export type PricedLine = CartLine & { unitPrice: number; lineTotal: number };

export const MAX_QTY_PER_LINE = 20;

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 0;
  return Math.max(0, Math.min(MAX_QTY_PER_LINE, Math.trunc(qty)));
}

/** Associe chaque ligne à son prix ; ignore les plats inconnus ou sans prix. */
export function priceLines(lines: CartLine[], priceOf: (slug: string) => number | null | undefined): PricedLine[] {
  return lines.flatMap((l) => {
    const unitPrice = priceOf(l.slug);
    const qty = clampQty(l.qty);
    if (unitPrice == null || qty === 0) return [];
    return [{ ...l, qty, unitPrice, lineTotal: unitPrice * qty }];
  });
}

export function subtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function itemCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + clampQty(l.qty), 0);
}
