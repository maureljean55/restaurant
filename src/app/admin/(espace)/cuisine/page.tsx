import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActionButton, AutoRefresh, Elapsed } from "@/components/admin/client";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { changeOrderStatus } from "@/lib/actions/admin";
import { debutDuJour, heureAbidjan, requireStaff } from "@/lib/admin/session";
import { minutesBetween, type OrderMode, type OrderStatus } from "@/lib/domain/workflow";
import { IconAlert, IconBag, IconBike, IconChef, IconCheck, IconClock } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Cuisine (KDS)" };

/** Au-delà (minutes depuis l'acceptation), un ticket passe en alerte. */
const SEUIL_CRITIQUE = 20;

type Ticket = {
  id: string;
  number: number;
  status: OrderStatus;
  mode: OrderMode;
  name: string;
  note: string | null;
  created_at: string;
  order_items: { name: string; qty: number }[];
  order_status_log: { status: OrderStatus; changed_at: string }[];
};

export default function CuisinePage() {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement des tickets…</p>}>
      <Cuisine />
    </Suspense>
  );
}

async function Cuisine() {
  const { db } = await requireStaff();
  const [tickets, enAttente, journal] = await Promise.all([
    db
      .from("orders")
      .select("id, number, status, mode, name, note, created_at, order_items(name, qty), order_status_log(status, changed_at)")
      .in("status", ["accepted", "preparing", "ready"])
      .order("created_at")
      .returns<Ticket[]>(),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "received"),
    db.from("order_status_log").select("order_id, status, changed_at").gte("changed_at", debutDuJour()).in("status", ["preparing", "ready"]).order("changed_at").returns<{ order_id: string; status: OrderStatus; changed_at: string }[]>(),
  ]);

  const liste = tickets.data ?? [];
  const depuis = (t: Ticket, s: OrderStatus) => t.order_status_log.filter((l) => l.status === s).at(-1)?.changed_at ?? t.created_at;
  const colonnes: { titre: string; statut: OrderStatus; vide: string }[] = [
    { titre: "Nouveaux", statut: "accepted", vide: "Aucun ticket à lancer" },
    { titre: "En préparation", statut: "preparing", vide: "Rien au feu" },
    { titre: "Prêts au passe", statut: "ready", vide: "Rien en attente au passe" },
  ];

  const debuts = new Map<string, string>();
  const durees: number[] = [];
  for (const l of journal.data ?? []) {
    if (l.status === "preparing") debuts.set(l.order_id, l.changed_at);
    else if (debuts.has(l.order_id)) durees.push(minutesBetween(debuts.get(l.order_id)!, new Date(l.changed_at)));
  }
  const moyenne = durees.length ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : null;
  const plats = liste.filter((t) => t.status !== "ready").flatMap((t) => t.order_items).reduce((m, l) => m.set(l.name, (m.get(l.name) ?? 0) + l.qty), new Map<string, number>());

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-or/25 bg-encre p-5 shadow-flottant md:p-6">
        <PageHeader
          eyebrow="Écran cuisine · en direct"
          title="Système d'affichage cuisine"
          description="Les commandes acceptées arrivent ici. Lancez-les, marquez-les prêtes, puis remettez-les ou envoyez-les en livraison."
          actions={<AutoRefresh secondes={15} />}
        />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Tickets en cours", valeur: liste.filter((t) => t.status !== "ready").length, Icon: IconChef },
            { label: "Prêts au passe", valeur: liste.filter((t) => t.status === "ready").length, Icon: IconCheck },
            { label: "Temps moyen aujourd'hui", valeur: moyenne === null ? "—" : `${moyenne} min`, Icon: IconClock },
            { label: "À accepter (caisse)", valeur: enAttente.count ?? 0, Icon: IconAlert },
          ].map(({ label, valeur, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-ligne bg-surface/60 p-3">
              <Icon width={20} height={20} className="shrink-0 text-or" />
              <span>
                <span className="block text-label-sm text-texte/55 uppercase">{label}</span>
                <span className="prix text-title text-ivoire">{valeur}</span>
              </span>
            </div>
          ))}
        </div>
        {(enAttente.count ?? 0) > 0 && (
          <Link href="/admin/commandes?statut=received" className="mt-3 inline-block text-body-sm text-or underline">
            {enAttente.count} commande(s) en attente d&apos;acceptation : ouvrir les commandes
          </Link>
        )}
      </div>

      {plats.size > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-sm text-texte/55 uppercase">À produire :</span>
          {[...plats].map(([nom, qte]) => (
            <span key={nom} className="rounded-full border border-ligne bg-surface px-3 py-1 text-body-sm text-ivoire">
              <span className="prix font-semibold text-or">{qte}×</span> {nom}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {colonnes.map((col) => {
          const items = liste.filter((t) => t.status === col.statut);
          return (
            <section key={col.statut} aria-label={col.titre} className="flex flex-col gap-4">
              <h2 className="flex items-center justify-between border-b border-ligne pb-2 text-label-lg text-champagne uppercase">
                {col.titre} <span className="prix text-or">{items.length}</span>
              </h2>
              {items.length === 0 ? (
                <EmptyState title={col.vide} />
              ) : (
                items.map((t) => {
                  const debut = depuis(t, col.statut === "accepted" ? "accepted" : col.statut === "preparing" ? "preparing" : "ready");
                  const attente = minutesBetween(depuis(t, "accepted"), new Date());
                  const critique = col.statut !== "ready" && attente >= SEUIL_CRITIQUE;
                  const tete = critique ? "bg-erreur text-noir" : col.statut === "ready" ? "bg-succes/90 text-noir" : col.statut === "preparing" ? "bg-or text-noir" : "bg-surface-haute text-ivoire";
                  return (
                    <article key={t.id} className={`overflow-hidden rounded-xl border bg-surface shadow-carte ${critique ? "border-erreur" : "border-ligne"}`}>
                      <header className={`flex items-center justify-between gap-2 px-4 py-2.5 ${tete}`}>
                        <span className="flex items-center gap-2 font-display text-title">
                          {critique && <IconAlert width={18} height={18} />}#{t.number}
                        </span>
                        <span className="flex items-center gap-2 text-label-md">
                          <IconClock width={15} height={15} />
                          <Elapsed since={debut} />
                          {critique && <span className="rounded bg-noir/20 px-1.5 uppercase">Critique</span>}
                        </span>
                      </header>
                      <div className="flex items-center justify-between gap-2 border-b border-ligne px-4 py-2">
                        <span className="flex items-center gap-1.5 text-label-sm text-champagne uppercase">
                          {t.mode === "delivery" ? <IconBike width={14} height={14} /> : <IconBag width={14} height={14} />}
                          {t.mode === "delivery" ? "Livraison" : "À emporter"}
                        </span>
                        <span className="truncate text-body-sm text-texte/70">
                          {t.name} · reçue à {heureAbidjan(t.created_at)}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1.5 p-4">
                        {t.order_items.map((l) => (
                          <li key={l.name} className="flex items-center gap-3 rounded-lg bg-surface-basse px-3 py-2">
                            <span className="prix grid size-8 shrink-0 place-items-center rounded-md bg-or font-display text-title text-noir">{l.qty}</span>
                            <span className="text-body-md text-ivoire">{l.name}</span>
                          </li>
                        ))}
                        {t.note && (
                          <li className="rounded-lg border border-erreur/40 bg-erreur/10 px-3 py-2 text-body-sm text-erreur">
                            <span className="font-semibold uppercase">Note : </span>
                            {t.note}
                          </li>
                        )}
                      </ul>
                      <div className="flex gap-2 px-4 pb-4">
                        {col.statut === "accepted" && (
                          <ActionButton className="flex-1" action={changeOrderStatus.bind(null, t.id, "preparing")}>
                            Commencer
                          </ActionButton>
                        )}
                        {col.statut === "preparing" && (
                          <ActionButton className="flex-1" action={changeOrderStatus.bind(null, t.id, "ready")}>
                            <IconCheck width={16} height={16} /> Tout est prêt
                          </ActionButton>
                        )}
                        {col.statut === "ready" && (
                          <ActionButton className="flex-1" tone="secondaire" action={changeOrderStatus.bind(null, t.id, t.mode === "delivery" ? "out_for_delivery" : "completed")}>
                            {t.mode === "delivery" ? "Remis au livreur" : "Remis au client"}
                          </ActionButton>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          );
        })}
      </div>
      <p className="text-[12px] text-texte/45">
        Un ticket passe en alerte {SEUIL_CRITIQUE} minutes après l&apos;acceptation. L&apos;écran se met à jour tout seul toutes les 15 secondes.
      </p>
    </div>
  );
}
