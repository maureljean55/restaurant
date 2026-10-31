"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrder, type OrderResult } from "@/lib/actions/order";
import { useCart } from "@/lib/cart";
import { orderSchema } from "@/lib/domain/order";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconBag, IconInfo, IconPin } from "@/components/ui/icons";

type Champs = NonNullable<Extract<OrderResult, { ok: false }>["fields"]>;

const champ =
  "h-11 w-full rounded-lg border border-sable bg-blanc px-3 text-body-md text-cacao outline-none placeholder:text-cacao/40 focus:border-vert focus:ring-1 focus:ring-vert aria-invalid:border-terracotta";

/** Récapitulatif et envoi de la commande (sans compte : suivi par lien). */
export function Commande() {
  const { lines, total, count, clear } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [erreurs, setErreurs] = useState<Champs>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const commande = { mode, name, phone, address, note, items: lines.map(({ slug, qty }) => ({ slug, qty })) };
    // Vérification immédiate dans le navigateur ; le serveur revérifie tout.
    const v = orderSchema.safeParse(commande);
    if (!v.success) {
      const champs: Champs = {};
      for (const i of v.error.issues) {
        const k = i.path[0];
        if (k === "mode" || k === "name" || k === "phone" || k === "address" || k === "note") champs[k] ??= i.message;
      }
      setErreurs(champs);
      return;
    }
    setErreurs({});
    demarrer(async () => {
      const r = await createOrder(commande);
      if (!r.ok) {
        setErreurs(r.fields ?? {});
        setErreur(r.error);
        return;
      }
      clear();
      router.push(`/commande?suivi=${r.token}`);
    });
  }

  const erreurChamp = (k: keyof Champs) =>
    erreurs[k] && (
      <p id={`err-${k}`} className="mt-1 text-[12px] text-terracotta">
        {erreurs[k]}
      </p>
    );

  return (
    <form onSubmit={envoyer} noValidate className="rounded-xl border border-sable/70 bg-blanc p-5 shadow-carte lg:sticky lg:top-24 lg:col-span-4">
      <fieldset>
        <legend className="surtitre text-cacao/60">Mode de réception</legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-creme p-1" role="radiogroup">
          {(
            [
              ["pickup", "À emporter"],
              ["delivery", "Livraison"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              onClick={() => setMode(id)}
              className={`h-10 rounded-full text-label-lg transition ${mode === id ? "bg-vert text-ivoire shadow-sm" : "text-cacao/70 hover:text-cacao"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-label-md text-cacao/80">Nom</span>
          <input className={`${champ} mt-1`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ex. Kouamé Aya" aria-invalid={!!erreurs.name} aria-describedby={erreurs.name ? "err-name" : undefined} />
          {erreurChamp("name")}
        </label>
        <label className="block">
          <span className="text-label-md text-cacao/80">Téléphone</span>
          <input className={`${champ} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="07 00 12 34 56" aria-invalid={!!erreurs.phone} aria-describedby={erreurs.phone ? "err-phone" : undefined} />
          {erreurChamp("phone")}
        </label>
        {mode === "delivery" && (
          <label className="block">
            <span className="text-label-md text-cacao/80">Adresse de livraison</span>
            <textarea className={`${champ} mt-1 h-20 py-2`} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Quartier, rue, repère (ex. Cocody, près de la pharmacie…)" aria-invalid={!!erreurs.address} aria-describedby={erreurs.address ? "err-address" : undefined} />
            {erreurChamp("address")}
          </label>
        )}
        <label className="block">
          <span className="text-label-md text-cacao/80">
            Précision <span className="text-cacao/50">(facultatif)</span>
          </span>
          <input className={`${champ} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Allergie, piment à part…" />
        </label>
      </div>

      <div className="mt-5 border-t border-sable pt-4">
        <div className="flex justify-between text-body-md text-cacao/75">
          <span>
            Sous-total ({count} article{count > 1 ? "s" : ""})
          </span>
          <span className="prix">{formatFCFA(total)}</span>
        </div>
        {mode === "delivery" && (
          <div className="mt-1 flex justify-between text-body-sm text-cacao/60">
            <span className="flex items-center gap-1">
              <IconPin width={14} height={14} /> Livraison
            </span>
            <span>Confirmée par le restaurant</span>
          </div>
        )}
        <div className="mt-3 flex items-baseline justify-between gap-3 font-display text-title text-vert">
          <span>{mode === "delivery" ? "Total hors livraison" : "Total"}</span>
          <span className="prix shrink-0">{formatFCFA(total)}</span>
        </div>
      </div>

      {erreur && (
        <p role="alert" className="mt-4 rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-body-sm text-terracotta">
          {erreur}
        </p>
      )}

      <button type="submit" disabled={enCours || lines.length === 0} aria-busy={enCours} className={`${btn.primary} ${btn.md} mt-5 w-full whitespace-nowrap`}>
        <IconBag width={18} height={18} />
        {enCours ? "Envoi en cours…" : "Envoyer la commande"}
      </button>
      <p className="mt-3 flex gap-2 text-[12px] text-cacao/65">
        <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-terracotta" />
        Paiement {mode === "delivery" ? "à la livraison" : "au retrait"}. Le montant est recalculé par le restaurant à
        l&apos;envoi ; vous recevez un lien pour suivre votre commande.
      </p>
    </form>
  );
}
