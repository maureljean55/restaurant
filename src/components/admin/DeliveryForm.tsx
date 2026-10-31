"use client";

import { useState, useTransition } from "react";
import { setDeliveryDetails } from "@/lib/actions/admin";

/** Frais de livraison et livreur d'une commande. */
export function DeliveryForm({ id, fee, courier, compact = false }: { id: string; fee: number | null; courier: string | null; compact?: boolean }) {
  const [frais, setFrais] = useState(fee === null ? "" : String(fee));
  const [livreur, setLivreur] = useState(courier ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();
  const champ = "h-9 w-full rounded-lg border border-ligne bg-surface-basse px-2.5 text-body-sm text-texte outline-none focus:border-or";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        demarrer(async () => {
          const r = await setDeliveryDetails(id, { fee: frais === "" ? null : Number(frais), courier: livreur });
          setMsg(r.ok ? { ok: true, texte: "Enregistré" } : { ok: false, texte: r.error });
        });
      }}
      className={`grid gap-2 ${compact ? "grid-cols-[1fr_6rem_auto]" : "sm:grid-cols-[1fr_8rem_auto]"} items-end`}
    >
      <label className="block min-w-0">
        <span className="text-label-sm text-texte/55 uppercase">Livreur</span>
        <input value={livreur} onChange={(e) => setLivreur(e.target.value)} maxLength={80} placeholder="Nom du livreur" className={champ} />
      </label>
      <label className="block">
        <span className="text-label-sm text-texte/55 uppercase">Frais (FCFA)</span>
        <input value={frais} onChange={(e) => setFrais(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="—" className={`${champ} prix`} />
      </label>
      <button disabled={enCours} className="h-9 rounded-full border border-or/60 px-3 text-label-md text-or uppercase hover:bg-or-sombre disabled:opacity-60">
        {enCours ? "…" : "OK"}
      </button>
      {msg && <span className={`col-span-full text-[12px] ${msg.ok ? "text-succes" : "text-erreur"}`}>{msg.texte}</span>}
    </form>
  );
}
