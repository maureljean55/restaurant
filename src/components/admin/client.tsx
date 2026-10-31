"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "@/lib/actions/admin";

const tons = {
  primaire: "bg-or text-noir hover:bg-or-clair",
  secondaire: "border border-or/60 bg-surface-haute text-or hover:border-or",
  danger: "border border-erreur/50 text-erreur hover:bg-erreur/10",
} as const;

/** Bouton qui déclenche une action serveur, avec état « en cours » et message d'erreur. */
export function ActionButton({
  action,
  children,
  tone = "primaire",
  confirm,
  className = "",
  size = "md",
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  tone?: keyof typeof tons;
  /** Question de confirmation (actions irréversibles) */
  confirm?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <button
        type="button"
        disabled={enCours}
        aria-busy={enCours}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setErreur(null);
          demarrer(async () => {
            const r = await action();
            if (!r.ok) setErreur(r.error);
          });
        }}
        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full text-label-md whitespace-nowrap uppercase transition-colors disabled:opacity-60 ${
          size === "sm" ? "h-8 px-3" : "h-10 px-4"
        } ${tons[tone]}`}
      >
        {enCours ? "…" : children}
      </button>
      {erreur && (
        <span role="alert" className="mt-1 text-[12px] text-erreur">
          {erreur}
        </span>
      )}
    </span>
  );
}

/** Rafraîchit la page toutes les `secondes` (onglet visible) et affiche l'heure de la dernière mise à jour. */
export function AutoRefresh({ secondes = 20 }: { secondes?: number }) {
  const router = useRouter();
  const [maj, setMaj] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaj(new Date());
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setMaj(new Date());
    };
    const id = window.setInterval(tick, secondes * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, secondes]);
  return (
    <span className="inline-flex items-center gap-1.5 text-label-sm text-texte/55">
      <span className="size-1.5 animate-pulse rounded-full bg-succes" />
      {maj ? `Actualisé à ${maj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "En direct"}
    </span>
  );
}

/** Minuteur « mm:ss » depuis un instant, mis à jour chaque seconde. Rouge au-delà du seuil (minutes). */
export function Elapsed({ since, alertAfter }: { since: string; alertAfter?: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (now === null) return <span className="prix">--:--</span>;
  const s = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  const m = Math.floor(s / 60);
  const txt = m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return <span className={`prix ${alertAfter !== undefined && m >= alertAfter ? "text-erreur" : ""}`}>{txt}</span>;
}
