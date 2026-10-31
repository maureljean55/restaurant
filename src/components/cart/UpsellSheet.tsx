"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCatalogue } from "@/lib/catalogue/context";
import type { Dish } from "@/lib/catalogue/types";
import { useCart } from "@/lib/cart";
import { suggestionsFor, type SuggestionGroup } from "@/lib/domain/suggestions";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconArrow, IconCheck, IconClose, IconMinus, IconPlus } from "@/components/ui/icons";

/**
 * Panneau « Complétez votre repas » (façon restauration rapide) :
 * s'ouvre après l'ajout d'un plat et propose accompagnements et boissons.
 * Téléphone : panneau qui monte du bas · Tablette/ordinateur : fenêtre centrée.
 */
export function UpsellSheet() {
  const { dishes, findDish } = useCatalogue();
  const { upsellFor, closeUpsell, lines, total, count, add, setQty, qtyOf } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);

  // Suggestions figées à l'ouverture : un article ajouté reste affiché (avec sa quantité).
  const [ouvertPour, setOuvertPour] = useState<string | null>(null);
  const [groupes, setGroupes] = useState<SuggestionGroup<Dish>[]>([]);
  if (upsellFor !== ouvertPour) {
    setOuvertPour(upsellFor);
    const ajoute = upsellFor ? findDish(upsellFor) : undefined;
    setGroupes(ajoute ? suggestionsFor(ajoute, dishes, new Set(lines.map((l) => l.slug))) : []);
  }

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (upsellFor && groupes.length > 0) {
      if (!d.open) d.showModal();
    } else {
      if (d.open) d.close();
      if (upsellFor) closeUpsell(); // rien à proposer : on ne dérange pas le client
    }
  }, [upsellFor, groupes, closeUpsell]);

  const plat = upsellFor ? findDish(upsellFor) : undefined;

  return (
    <dialog
      ref={dialog}
      onClose={closeUpsell}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      aria-labelledby="upsell-titre"
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-ligne bg-surface p-0 text-texte shadow-flottant backdrop:bg-noir/45 backdrop:backdrop-blur-sm open:animate-[monter_.32s_cubic-bezier(.2,.8,.2,1)] md:m-auto md:max-w-xl md:rounded-2xl md:open:animate-[apparaitre_.25s_ease-out]"
    >
      {plat && (
        <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
          {/* Poignée (téléphone) */}
          <span className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-noir/20 md:hidden" aria-hidden />

          {/* Confirmation de l'ajout */}
          <div className="flex items-center gap-3 border-b border-ligne/70 px-4 pt-3 pb-4 sm:px-6 md:pt-5">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-haute">
              {plat.photo && <Image src={plat.photo} alt="" fill sizes="48px" className="object-cover" />}
              <span className="absolute inset-0 grid place-items-center bg-noir/60 text-or">
                <IconCheck width={22} height={22} />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label-sm text-or uppercase">Ajouté au panier</p>
              <p className="truncate font-display text-title">{plat.name}</p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Fermer"
              className="grid size-10 shrink-0 place-items-center rounded-full text-texte/60 hover:bg-surface-haute hover:text-texte"
            >
              <IconClose width={20} height={20} />
            </button>
          </div>

          <div className="px-4 pt-4 sm:px-6">
            <h2 id="upsell-titre" className="text-headline-sm text-or">
              Complétez votre repas
            </h2>
            <p className="text-body-sm text-texte/65">Ça va très bien avec votre {plat.name.toLowerCase()}.</p>
          </div>

          {groupes.map((g) => (
            <section key={g.id} aria-label={g.title} className="px-4 pt-4 sm:px-6">
              <h3 className="surtitre font-sans text-champagne">{g.title}</h3>
              <ul className="mt-2 grid grid-cols-2 gap-3">
                {g.items.map((d) => {
                  const qte = qtyOf(d.slug);
                  return (
                    <li key={d.slug} className={`overflow-hidden rounded-xl border bg-surface shadow-carte transition-colors ${qte ? "border-or" : "border-ligne/70"}`}>
                      <span className="relative block aspect-[16/10] bg-surface-haute">
                        {d.photo && <Image src={d.photo} alt="" fill sizes="(min-width: 768px) 260px, 45vw" className="object-cover" />}
                        {qte > 0 && (
                          <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-or text-noir shadow-sm">
                            <IconCheck width={14} height={14} />
                          </span>
                        )}
                      </span>
                      <div className="p-2.5">
                        <p className="truncate font-display text-[0.95rem] font-semibold">{d.name}</p>
                        <p className="prix text-label-md text-champagne">+ {formatFCFA(d.price!)}</p>
                        {qte === 0 ? (
                          <button
                            type="button"
                            onClick={() => add(d.slug)}
                            aria-label={`Ajouter ${d.name}`}
                            className={`${btn.primary} mt-2 h-9 w-full px-2`}
                          >
                            <IconPlus width={16} height={16} /> Ajouter
                          </button>
                        ) : (
                          <div className="mt-2 flex h-9 items-center justify-between rounded-full bg-surface-basse p-0.5">
                            <button type="button" onClick={() => setQty(d.slug, qte - 1)} aria-label={`Retirer un ${d.name}`} className="grid size-8 place-items-center rounded-full bg-surface text-or shadow-sm">
                              <IconMinus width={15} height={15} />
                            </button>
                            <span className="text-label-lg" aria-live="polite">{qte}</span>
                            <button type="button" onClick={() => setQty(d.slug, qte + 1)} aria-label={`Ajouter un ${d.name}`} className="grid size-8 place-items-center rounded-full bg-surface text-or shadow-sm">
                              <IconPlus width={15} height={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Actions */}
          <div className="sticky bottom-0 mt-5 flex flex-col gap-2 border-t border-ligne/70 bg-fond/95 px-4 py-3 backdrop-blur-md sm:flex-row-reverse sm:px-6">
            <Link href="/panier" onClick={() => dialog.current?.close()} className={`${btn.primary} ${btn.md} whitespace-nowrap sm:flex-1`}>
              <span>
                Voir le panier · <span className="prix">{formatFCFA(total)}</span>
              </span>
              <IconArrow width={16} height={16} />
            </Link>
            <button type="button" onClick={() => dialog.current?.close()} className={`${btn.outline} ${btn.md} sm:flex-1`}>
              {count > 1 ? "Continuer mes achats" : "Non merci"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
