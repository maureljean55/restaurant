"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Dish, Spice } from "@/lib/catalogue/types";
import { DishCard } from "@/components/dish/DishCard";
import { useCart } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconArrow, IconBag, IconCarte, IconCube, IconFire, IconInfo, IconSearch, IconSort } from "@/components/ui/icons";

type Tri = "popularite" | "prix-asc" | "prix-desc";
const piments: (Spice | "tous")[] = ["tous", "doux", "moyen", "fort"];
const libellePiment = { tous: "Piment : tous", doux: "Piment : doux", moyen: "Piment : moyen", fort: "Piment : fort" };

/** Enlève accents et majuscules pour une recherche tolérante (« kedjenou » trouve « Kédjénou »). */
const normaliser = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const chip = (actif: boolean) =>
  `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-md transition-colors ${
    actif ? "bg-or text-noir shadow-sm" : "bg-surface-haute text-texte/75 hover:text-texte"
  }`;

export function MenuExplorer({ dishes, categories }: { dishes: Dish[]; categories: Category[] }) {
  const [categorie, setCategorie] = useState("toutes");
  const [recherche, setRecherche] = useState("");
  const [dispoSeulement, setDispoSeulement] = useState(false);
  const [avec3d, setAvec3d] = useState(false);
  const [piment, setPiment] = useState<Spice | "tous">("tous");
  const [tri, setTri] = useState<Tri>("popularite");
  const { count, total } = useCart();

  const visibles = useMemo(() => {
    const q = normaliser(recherche.trim());
    const liste = dishes.filter(
      (d) =>
        (categorie === "toutes" || d.category === categorie) &&
        (!dispoSeulement || d.available) &&
        (!avec3d || !!d.model) &&
        (piment === "tous" || d.spice === piment) &&
        (!q || normaliser(`${d.name} ${d.description} ${d.tags.join(" ")}`).includes(q)),
    );
    const prix = (d: Dish) => d.price ?? Number.MAX_SAFE_INTEGER;
    return liste.sort((a, b) =>
      tri === "prix-asc" ? prix(a) - prix(b) : tri === "prix-desc" ? prix(b) - prix(a) : b.popularity - a.popularity,
    );
  }, [dishes, categorie, recherche, dispoSeulement, avec3d, piment, tri]);

  const reinitialiser = () => {
    setCategorie("toutes");
    setRecherche("");
    setDispoSeulement(false);
    setAvec3d(false);
    setPiment("tous");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-32 md:px-8 md:pt-8 md:pb-20 lg:px-12">
      {/* En-tête de page */}
      <div className="flex items-center justify-between">
        <p className="surtitre text-champagne">Gastronomie ivoirienne</p>
        <span className="flex items-center gap-1.5 text-label-sm text-texte/60">
          <span className="size-1.5 rounded-full bg-or" /> Commande en ligne
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4">
        <h1 className="text-headline-lg-mobile text-texte md:text-headline-lg">La carte</h1>
        <span className="text-label-sm text-texte/60" aria-live="polite">
          {visibles.length} plat{visibles.length > 1 ? "s" : ""}
        </span>
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-champagne/60 bg-or-sombre/40 px-3 py-2 text-body-sm text-texte/80">
        <IconInfo width={16} height={16} className="mt-0.5 shrink-0 text-champagne" />
        Carte de démonstration : plats, prix, photos et modèles 3D sont des exemples, à remplacer par la carte réelle.
      </p>

      {/* Barre d'outils : collante sous l'en-tête sur ordinateur uniquement (trop haute sur téléphone) */}
      <div className="z-30 -mx-4 mt-4 bg-fond/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:sticky lg:top-[4.5rem] lg:-mx-12 lg:px-12">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-11 items-center gap-2 rounded-full bg-surface-haute px-4 lg:w-80">
            <IconSearch width={19} height={19} className="text-or" />
            <span className="sr-only">Rechercher un plat</span>
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher (attiéké, alloco, kedjenou…)"
              className="w-full bg-transparent text-body-sm text-texte outline-none placeholder:text-texte/45"
            />
          </label>

          <div role="tablist" aria-label="Catégories" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
            {[{ id: "toutes", label: "Tout" }, ...categories].map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={categorie === c.id}
                onClick={() => setCategorie(c.id)}
                className={chip(categorie === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
            <button aria-pressed={dispoSeulement} onClick={() => setDispoSeulement((v) => !v)} className={chip(dispoSeulement)}>
              <span className={`size-2 rounded-full ${dispoSeulement ? "bg-or" : "bg-or"}`} />
              Disponible maintenant
            </button>
            <button aria-pressed={avec3d} onClick={() => setAvec3d((v) => !v)} className={chip(avec3d)}>
              <IconCube width={15} height={15} />
              Modèle 3D disponible
            </button>
            <button
              onClick={() => setPiment((p) => piments[(piments.indexOf(p) + 1) % piments.length])}
              className={piment === "tous" ? chip(false) : `${chip(false)} !bg-erreur !text-noir`}
              aria-label={`${libellePiment[piment]}. Toucher pour changer`}
            >
              <IconFire width={15} height={15} />
              {libellePiment[piment]}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-label-sm text-texte/65">
              <IconSort width={16} height={16} className="text-champagne" /> Trier
            </span>
            <div className="flex rounded-full bg-surface-basse p-1" role="radiogroup" aria-label="Trier les plats">
              {(
                [
                  ["popularite", "Popularité"],
                  ["prix-asc", "Prix ↑"],
                  ["prix-desc", "Prix ↓"],
                ] as [Tri, string][]
              ).map(([v, l]) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={tri === v}
                  onClick={() => setTri(v)}
                  className={`rounded-full px-3 py-1.5 text-label-sm transition-colors ${
                    tri === v ? "bg-surface text-or shadow-sm" : "text-texte/65 hover:text-or"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {visibles.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visibles.map((dish) => (
            <li key={dish.slug}>
              <DishCard dish={dish} categoryLabel={categories.find((c) => c.id === dish.category)?.label} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-surface-haute text-champagne">
            <IconCarte width={34} height={34} />
          </span>
          <h2 className="mt-4 text-headline-sm text-texte">Aucun plat trouvé</h2>
          <p className="mt-1 max-w-xs text-body-md text-texte/70">
            Aucun plat ne correspond à ces filtres. Réinitialisez-les pour revoir toute la carte.
          </p>
          <button onClick={reinitialiser} className={`${btn.secondary} ${btn.sm} mt-5`}>
            Voir toute la carte
          </button>
        </div>
      )}

      {/* Barre panier flottante : au-dessus de la barre d'onglets sur téléphone */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-or/40 bg-surface-haute py-2 pr-2 pl-3 text-ivoire shadow-flottant">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-encre">
                <IconBag width={18} height={18} className="text-champagne" />
                <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-or text-[10px] font-bold text-noir">
                  {count}
                </span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-label-md">
                  {count} plat{count > 1 ? "s" : ""} au panier
                </p>
                <p className="prix text-label-sm text-champagne">{formatFCFA(total)}</p>
              </div>
            </div>
            <Link href="/panier" className={`${btn.primary} h-10 shrink-0 px-4`}>
              Voir le panier <IconArrow width={16} height={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
