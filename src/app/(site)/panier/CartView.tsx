"use client";

import Image from "next/image";
import Link from "next/link";
import { findDemoDish } from "@/data/demo-dishes";
import { useCart } from "@/lib/cart";
import { MAX_QTY_PER_LINE } from "@/lib/domain/pricing";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconBag, IconInfo, IconMinus, IconPlus, IconTrash } from "@/components/ui/icons";

export function CartView() {
  const { lines, total, count, setQty, remove } = useCart();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-16 md:px-8 md:pt-8 lg:pb-24">
      <p className="surtitre text-terracotta">Votre commande</p>
      <h1 className="mt-1 text-headline-lg-mobile text-cacao md:text-headline-lg">Panier</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center rounded-full bg-creme-fonce text-terracotta">
            <IconBag width={34} height={34} />
          </span>
          <h2 className="mt-4 text-headline-sm text-cacao">Votre panier est vide</h2>
          <p className="mt-1 max-w-xs text-body-md text-cacao/70">Parcourez la carte et ajoutez les plats qui vous font envie.</p>
          <Link href="/menu" className={`${btn.primary} ${btn.md} mt-5`}>
            Voir la carte
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          <ul className="flex flex-col gap-3 lg:col-span-8">
            {lines.map((l) => {
              const d = findDemoDish(l.slug)!;
              return (
                <li key={l.slug} className="flex gap-3 rounded-xl border border-sable/70 bg-blanc p-3 shadow-carte">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-creme-fonce sm:size-24">
                    {d.photo && <Image src={d.photo} alt="" fill sizes="96px" className="object-cover" />}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-title text-cacao">{d.name}</p>
                      <button type="button" onClick={() => remove(l.slug)} aria-label={`Retirer ${d.name}`} className="grid size-8 shrink-0 place-items-center rounded-full text-cacao/50 hover:bg-creme hover:text-terracotta">
                        <IconTrash width={18} height={18} />
                      </button>
                    </div>
                    <p className="prix text-body-sm text-cacao/60">{formatFCFA(l.unitPrice)} l&apos;unité</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full bg-creme p-1">
                        <button type="button" aria-label="Retirer un" onClick={() => setQty(l.slug, l.qty - 1)} className="grid size-8 place-items-center rounded-full bg-blanc text-vert shadow-sm">
                          <IconMinus width={16} height={16} />
                        </button>
                        <span className="w-7 text-center text-label-lg text-cacao" aria-live="polite">{l.qty}</span>
                        <button type="button" aria-label="Ajouter un" disabled={l.qty >= MAX_QTY_PER_LINE} onClick={() => setQty(l.slug, l.qty + 1)} className="grid size-8 place-items-center rounded-full bg-blanc text-vert shadow-sm disabled:opacity-40">
                          <IconPlus width={16} height={16} />
                        </button>
                      </div>
                      <p className="prix text-label-lg text-vert">{formatFCFA(l.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-xl border border-sable/70 bg-blanc p-5 shadow-carte lg:sticky lg:top-24 lg:col-span-4">
            <div className="flex justify-between text-body-md text-cacao/75">
              <span>Sous-total ({count} article{count > 1 ? "s" : ""})</span>
              <span className="prix">{formatFCFA(total)}</span>
            </div>
            <div className="mt-2 flex justify-between text-body-sm text-cacao/60">
              <span>Livraison</span>
              <span>Calculée à l&apos;étape suivante</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-sable pt-4 font-display text-title text-vert">
              <span>Total estimé</span>
              <span className="prix">{formatFCFA(total)}</span>
            </div>
            <button type="button" disabled className={`${btn.primary} ${btn.md} mt-5 w-full`}>
              Valider la commande
            </button>
            <p className="mt-3 flex gap-2 text-[12px] text-cacao/65">
              <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-terracotta" />
              Bientôt disponible : choix retrait ou livraison et paiement. Prix d&apos;exemple ; le montant final sera
              recalculé par le restaurant.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
