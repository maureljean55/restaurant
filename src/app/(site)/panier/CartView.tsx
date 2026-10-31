"use client";

import Image from "next/image";
import Link from "next/link";
import { useCatalogue } from "@/lib/catalogue/context";
import { Commande } from "./Commande";
import { useCart } from "@/lib/cart";
import { MAX_QTY_PER_LINE } from "@/lib/domain/pricing";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconBag, IconMinus, IconPlus, IconTrash } from "@/components/ui/icons";

export function CartView() {
  const { findDish } = useCatalogue();
  const { lines, setQty, remove } = useCart();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-16 md:px-8 md:pt-8 lg:pb-24">
      <p className="surtitre text-champagne">Votre commande</p>
      <h1 className="mt-1 text-headline-lg-mobile text-texte md:text-headline-lg">Panier</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-full bg-surface-haute text-champagne">
            <IconBag width={34} height={34} />
          </span>
          <h2 className="mt-4 text-headline-sm text-texte">Votre panier est vide</h2>
          <p className="mt-1 max-w-xs text-body-md text-texte/70">Parcourez la carte et ajoutez les plats qui vous font envie.</p>
          <Link href="/menu" className={`${btn.primary} ${btn.md} mt-5`}>
            Voir la carte
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          <ul className="flex flex-col gap-3 lg:col-span-8">
            {lines.map((l) => {
              const d = findDish(l.slug)!;
              return (
                <li key={l.slug} className="flex gap-3 rounded-xl border border-ligne/70 bg-surface p-3 shadow-carte">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-haute sm:size-24">
                    {d.photo && <Image src={d.photo} alt="" fill sizes="96px" className="object-cover" />}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-title text-texte">{d.name}</p>
                      <button type="button" onClick={() => remove(l.slug)} aria-label={`Retirer ${d.name}`} className="grid size-8 shrink-0 place-items-center rounded-full text-texte/50 hover:bg-surface-basse hover:text-champagne">
                        <IconTrash width={18} height={18} />
                      </button>
                    </div>
                    <p className="prix text-body-sm text-texte/60">{formatFCFA(l.unitPrice)} l&apos;unité</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full bg-surface-basse p-1">
                        <button type="button" aria-label="Retirer un" onClick={() => setQty(l.slug, l.qty - 1)} className="grid size-8 place-items-center rounded-full bg-surface text-or shadow-sm">
                          <IconMinus width={16} height={16} />
                        </button>
                        <span className="w-7 text-center text-label-lg text-texte" aria-live="polite">{l.qty}</span>
                        <button type="button" aria-label="Ajouter un" disabled={l.qty >= MAX_QTY_PER_LINE} onClick={() => setQty(l.slug, l.qty + 1)} className="grid size-8 place-items-center rounded-full bg-surface text-or shadow-sm disabled:opacity-40">
                          <IconPlus width={16} height={16} />
                        </button>
                      </div>
                      <p className="prix text-label-lg text-or">{formatFCFA(l.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <Commande />
        </div>
      )}
    </div>
  );
}
