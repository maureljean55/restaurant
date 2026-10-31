"use client";

import { useRef, useState, useTransition } from "react";
import { updateDish } from "@/lib/actions/admin";
import { IconEdit } from "@/components/ui/icons";

type Plat = { slug: string; name: string; description: string; price: number | null; badge: string | null; available: boolean };

const champ = "mt-1 w-full rounded-lg border border-ligne bg-surface-basse px-3 text-body-md text-texte outline-none focus:border-or focus:ring-1 focus:ring-or";

/** Fiche d'édition d'un plat (administrateurs). */
export function DishEditor({ plat }: { plat: Plat }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const [f, setF] = useState({ name: plat.name, description: plat.description, price: plat.price === null ? "" : String(plat.price), badge: plat.badge ?? "", available: plat.available });
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setF({ name: plat.name, description: plat.description, price: plat.price === null ? "" : String(plat.price), badge: plat.badge ?? "", available: plat.available });
          setErreur(null);
          dialogue.current?.showModal();
        }}
        aria-label={`Modifier ${plat.name}`}
        className="grid size-9 place-items-center rounded-full border border-ligne text-texte hover:border-or hover:text-or"
      >
        <IconEdit width={16} height={16} />
      </button>
      <dialog ref={dialogue} aria-labelledby={`edit-${plat.slug}`} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-ligne bg-surface p-0 text-texte shadow-flottant backdrop:bg-noir/60 backdrop:backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErreur(null);
            demarrer(async () => {
              const r = await updateDish(plat.slug, {
                name: f.name,
                description: f.description,
                price: f.price === "" ? null : Number(f.price),
                badge: f.badge || null,
                available: f.available,
              });
              if (r.ok) dialogue.current?.close();
              else setErreur(r.error);
            });
          }}
          className="flex flex-col gap-4 p-5"
        >
          <div>
            <p className="surtitre text-champagne">Fiche du plat</p>
            <h2 id={`edit-${plat.slug}`} className="text-headline-sm text-or">
              {plat.name}
            </h2>
          </div>
          <label className="block">
            <span className="text-label-md text-texte/80">Nom</span>
            <input required maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${champ} h-11`} />
          </label>
          <label className="block">
            <span className="text-label-md text-texte/80">Description</span>
            <textarea rows={3} maxLength={400} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${champ} resize-none py-2`} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-label-md text-texte/80">Prix (FCFA)</span>
              <input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "").slice(0, 7) })} placeholder="Non communiqué" className={`${champ} prix h-11`} />
            </label>
            <label className="block">
              <span className="text-label-md text-texte/80">Étiquette</span>
              <input maxLength={30} value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value })} placeholder="ex. Signature" className={`${champ} h-11`} />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-lg bg-surface-basse p-3">
            <input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} className="size-4 accent-or" />
            <span className="text-body-md">Disponible à la commande</span>
          </label>
          {erreur && (
            <p role="alert" className="text-body-sm text-erreur">
              {erreur}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => dialogue.current?.close()} className="h-11 rounded-full border border-ligne px-5 text-label-md text-texte uppercase hover:border-or">
              Annuler
            </button>
            <button disabled={enCours} className="h-11 rounded-full bg-or px-5 text-label-md text-noir uppercase hover:bg-or-clair disabled:opacity-60">
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
          <p className="text-[12px] text-texte/50">Les changements apparaissent immédiatement sur le site public.</p>
        </form>
      </dialog>
    </>
  );
}
