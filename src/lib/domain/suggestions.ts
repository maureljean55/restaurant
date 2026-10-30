/**
 * Suggestions « Complétez votre repas » affichées après l'ajout d'un plat au panier.
 * Logique pure : facile à tester et à réutiliser quand les plats viendront de Supabase.
 */

export type DishForSuggestion = {
  slug: string;
  category: string;
  available: boolean;
  price: number | null;
  popularity: number;
  pairsWith?: string[];
};

export type SuggestionGroup<T> = { id: "accompagnements" | "boissons"; title: string; items: T[] };

const PAR_GROUPE = 2;

export function suggestionsFor<T extends DishForSuggestion>(added: T, all: T[], inCart: Set<string>): SuggestionGroup<T>[] {
  // On ne relance pas sur une boisson : le client termine sa commande.
  if (added.category === "boissons") return [];

  const candidats = all.filter((d) => d.slug !== added.slug && d.available && d.price !== null && !inCart.has(d.slug));
  const rang = (d: T) => {
    const i = added.pairsWith?.indexOf(d.slug) ?? -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i; // associations choisies par le restaurant d'abord
  };
  const trier = (liste: T[]) => liste.sort((a, b) => rang(a) - rang(b) || b.popularity - a.popularity).slice(0, PAR_GROUPE);

  const groupes: SuggestionGroup<T>[] = [];
  if (added.category !== "accompagnements") {
    groupes.push({ id: "accompagnements", title: "Un accompagnement ?", items: trier(candidats.filter((d) => d.category === "accompagnements")) });
  }
  groupes.push({ id: "boissons", title: "Une boisson pour aller avec ?", items: trier(candidats.filter((d) => d.category === "boissons")) });
  return groupes.filter((g) => g.items.length > 0);
}
