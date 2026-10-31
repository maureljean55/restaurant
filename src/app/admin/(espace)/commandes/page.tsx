import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActionButton, AutoRefresh } from "@/components/admin/client";
import { DeliveryForm } from "@/components/admin/DeliveryForm";
import { compteurClasse, EmptyState, formatPhone, Kpi, ongletClasse, OrderBadge, PageHeader, Panel, telHref, whatsappHref } from "@/components/admin/ui";
import { changeOrderStatus, setOrderPaid } from "@/lib/actions/admin";
import { dateAbidjan, debutDuJour, heureAbidjan, ilYA, requireStaff } from "@/lib/admin/session";
import { ACTIVE_ORDER, minutesBetween, orderStatusLabel, orderTransitions, type OrderMode, type OrderStatus } from "@/lib/domain/workflow";
import { formatFCFA } from "@/lib/format";
import { IconBag, IconBike, IconChat, IconPhone, IconReceipt } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Commandes" };

type Commande = {
  id: string;
  number: number;
  token: string;
  status: OrderStatus;
  mode: OrderMode;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  delivery_fee: number | null;
  payment_status: "paid" | "unpaid";
  courier_name: string | null;
  created_at: string;
  order_items: { name: string; qty: number; unit_price: number; line_total: number }[];
};

const ONGLETS: { id: string; label: string; statuts: OrderStatus[] }[] = [
  { id: "actives", label: "En cours", statuts: ACTIVE_ORDER },
  { id: "received", label: "En attente", statuts: ["received"] },
  { id: "accepted", label: "En cuisine", statuts: ["accepted", "preparing"] },
  { id: "ready", label: "Prêtes", statuts: ["ready"] },
  { id: "out_for_delivery", label: "En livraison", statuts: ["out_for_delivery"] },
  { id: "completed", label: "Terminées", statuts: ["completed"] },
  { id: "cancelled", label: "Annulées", statuts: ["cancelled"] },
];

export default function CommandesPage({ searchParams }: PageProps<"/admin/commandes">) {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement des commandes…</p>}>
      <Commandes searchParams={searchParams} />
    </Suspense>
  );
}

async function Commandes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { db } = await requireStaff();
  const sp = await searchParams;
  const un = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = un("q").trim();
  // « preparing » appartient à l'onglet « En cuisine »
  const ongletId = un("statut") === "preparing" ? "accepted" : un("statut");
  const onglet = ONGLETS.find((o) => o.id === ongletId) ?? (q ? null : ONGLETS[0]);
  const depuis = ilYA(30);

  let requete = db
    .from("orders")
    .select("id, number, token, status, mode, name, phone, address, note, subtotal, delivery_fee, payment_status, courier_name, created_at, order_items(name, qty, unit_price, line_total)")
    .order("created_at", { ascending: false })
    .limit(60);
  if (q) {
    const chiffres = q.replace(/\D/g, "");
    requete = /^#?\d{1,6}$/.test(q)
      ? requete.eq("number", Number(chiffres))
      : requete.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,phone.ilike.%${chiffres || "∅"}%`);
  } else {
    requete = requete.gte("created_at", depuis);
  }
  if (onglet) requete = requete.in("status", onglet.statuts);

  const [liste, compteurs, jour] = await Promise.all([
    requete.returns<Commande[]>(),
    db.from("orders").select("status").gte("created_at", depuis).returns<{ status: OrderStatus }[]>(),
    db.from("orders").select("status, subtotal, delivery_fee, mode").gte("created_at", debutDuJour()).neq("status", "cancelled").returns<{ status: OrderStatus; subtotal: number; delivery_fee: number | null; mode: OrderMode }[]>(),
  ]);

  const commandes = liste.data ?? [];
  const idChoisi = un("id");
  let choisie = commandes.find((c) => c.id === idChoisi) ?? (idChoisi ? null : commandes[0]);
  if (idChoisi && !choisie) {
    const { data } = await db
      .from("orders")
      .select("id, number, token, status, mode, name, phone, address, note, subtotal, delivery_fee, payment_status, courier_name, created_at, order_items(name, qty, unit_price, line_total)")
      .eq("id", idChoisi)
      .maybeSingle<Commande>();
    choisie = data;
  }
  const historique = choisie
    ? ((await db.from("order_status_log").select("status, changed_at").eq("order_id", choisie.id).order("changed_at")).data as { status: OrderStatus; changed_at: string }[] | null) ?? []
    : [];

  const nb = (statuts: OrderStatus[]) => (compteurs.data ?? []).filter((c) => statuts.includes(c.status)).length;
  const duJour = jour.data ?? [];
  const caJour = duJour.reduce((s, c) => s + c.subtotal + (c.delivery_fee ?? 0), 0);
  const lien = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(onglet ? { statut: onglet.id } : {}), ...(q ? { q } : {}), ...extra });
    return `/admin/commandes?${p}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Opérations · 30 derniers jours"
        title="Gestion des commandes"
        description="Suivez chaque commande de la réception à la remise ou la livraison. Les prix sont ceux recalculés par la base."
        actions={<AutoRefresh secondes={20} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Chiffre d'affaires du jour" value={caJour.toLocaleString("fr-FR")} unit="FCFA" />
        <Kpi label="Commandes du jour" value={duJour.length} hint={`${duJour.filter((c) => c.mode === "delivery").length} en livraison`} />
        <Kpi label="Panier moyen du jour" value={duJour.length ? Math.round(caJour / duJour.length).toLocaleString("fr-FR") : "—"} unit={duJour.length ? "FCFA" : undefined} />
        <Kpi label="En attente d'acceptation" value={nb(["received"])} hint={nb(["received"]) ? "À traiter en priorité" : "Rien en attente"} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex w-max gap-2">
          {ONGLETS.map((o) => {
            const a = onglet?.id === o.id;
            return (
              <Link key={o.id} href={`/admin/commandes?statut=${o.id}`} className={ongletClasse(a)}>
                {o.label} <span className={compteurClasse(a)}>{nb(o.statuts)}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {q && (
        <p className="text-body-sm text-texte/65">
          Recherche « {q} » : {commandes.length} résultat{commandes.length > 1 ? "s" : ""}.{" "}
          <Link href="/admin/commandes" className="text-or underline">
            Effacer
          </Link>
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel title="Registre des commandes" className="xl:col-span-7">
          {commandes.length === 0 ? (
            <EmptyState title="Aucune commande ici" icon={<IconReceipt width={22} height={22} />}>
              Les commandes passées sur le site apparaissent automatiquement.
            </EmptyState>
          ) : (
            <ul className="-mx-4 divide-y divide-ligne/70 sm:-mx-5">
              {commandes.map((c) => {
                const a = choisie?.id === c.id;
                return (
                  <li key={c.id}>
                    <Link
                      href={lien({ id: c.id })}
                      scroll={false}
                      aria-current={a ? "true" : undefined}
                      className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors sm:px-5 ${a ? "bg-or-sombre" : "hover:bg-surface-basse"}`}
                    >
                      <span className="prix font-display text-title text-or">#{c.number}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-body-md text-ivoire">{c.name}</span>
                        <span className="block truncate text-body-sm text-texte/55">
                          {c.mode === "delivery" ? "Livraison" : "À emporter"} · {c.order_items.reduce((s, l) => s + l.qty, 0)} article(s) ·{" "}
                          {c.created_at >= debutDuJour() ? heureAbidjan(c.created_at) : dateAbidjan(c.created_at, { day: "numeric", month: "short" })}
                          {ACTIVE_ORDER.includes(c.status) && ` · il y a ${minutesBetween(c.created_at, new Date())} min`}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="prix text-body-md text-ivoire">{formatFCFA(c.subtotal + (c.delivery_fee ?? 0))}</span>
                        <OrderBadge status={c.status} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="xl:col-span-5">{choisie ? <Detail c={choisie} historique={historique} /> : null}</div>
      </div>
    </div>
  );
}

function Detail({ c, historique }: { c: Commande; historique: { status: OrderStatus; changed_at: string }[] }) {
  const total = c.subtotal + (c.delivery_fee ?? 0);
  return (
    <section className="sticky top-24 overflow-hidden rounded-xl border border-or/30 bg-surface shadow-flottant">
      <div className="flex items-start justify-between gap-3 bg-encre px-5 py-4">
        <div>
          <p className="prix font-display text-headline-md text-or">Commande #{c.number}</p>
          <p className="text-body-sm text-texte/60">
            {dateAbidjan(c.created_at, { weekday: "long", day: "numeric", month: "long" })} à {heureAbidjan(c.created_at)}
          </p>
        </div>
        <span className="flex flex-col items-end gap-1.5">
          <OrderBadge status={c.status} />
          <span className="inline-flex items-center gap-1 text-label-sm text-champagne uppercase">
            {c.mode === "delivery" ? <IconBike width={14} height={14} /> : <IconBag width={14} height={14} />}
            {c.mode === "delivery" ? "Livraison" : "À emporter"}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div>
          <p className="text-title text-ivoire">{c.name}</p>
          <p className="prix text-body-sm text-texte/65">+225 {formatPhone(c.phone)}</p>
          {c.address && <p className="mt-1 text-body-sm text-texte/75">{c.address}</p>}
          <div className="mt-3 flex gap-2">
            <a href={telHref(c.phone)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ligne px-3 text-label-md text-texte hover:border-or hover:text-or">
              <IconPhone width={15} height={15} /> Appeler
            </a>
            <a
              href={whatsappHref(c.phone, `Bonjour ${c.name}, au sujet de votre commande n° ${c.number} chez LE-TCHE…`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ligne px-3 text-label-md text-texte hover:border-or hover:text-or"
            >
              <IconChat width={15} height={15} /> WhatsApp
            </a>
          </div>
        </div>

        {c.note && (
          <div className="rounded-lg border border-champagne/25 bg-champagne/5 p-3">
            <p className="text-label-sm text-champagne uppercase">Précision du client</p>
            <p className="mt-1 text-body-sm text-texte italic">« {c.note} »</p>
          </div>
        )}

        <div>
          <p className="text-label-sm text-texte/55 uppercase">Détail</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {c.order_items.map((l) => (
              <li key={l.name} className="flex items-center gap-3 rounded-lg bg-surface-basse px-3 py-2">
                <span className="prix grid size-7 shrink-0 place-items-center rounded-md bg-or text-label-md text-noir">{l.qty}</span>
                <span className="min-w-0 flex-1 truncate text-body-md text-ivoire">{l.name}</span>
                <span className="prix text-body-sm text-texte/70">{formatFCFA(l.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 text-body-sm">
            <div className="flex justify-between text-texte/65">
              <dt>Sous-total</dt>
              <dd className="prix">{formatFCFA(c.subtotal)}</dd>
            </div>
            {c.mode === "delivery" && (
              <div className="flex justify-between text-texte/65">
                <dt>Livraison</dt>
                <dd className="prix">{c.delivery_fee === null ? "à fixer" : formatFCFA(c.delivery_fee)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ligne pt-2 font-display text-title text-or">
              <dt>Total</dt>
              <dd className="prix">{formatFCFA(total)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-surface-basse px-3 py-2">
            <span className={`text-label-md uppercase ${c.payment_status === "paid" ? "text-succes" : "text-or"}`}>
              {c.payment_status === "paid" ? "Payée" : "À encaisser"} · {c.mode === "delivery" ? "à la livraison" : "au retrait"}
            </span>
            <ActionButton size="sm" tone="secondaire" action={setOrderPaid.bind(null, c.id, c.payment_status !== "paid")}>
              {c.payment_status === "paid" ? "Annuler le paiement" : "Marquer payée"}
            </ActionButton>
          </div>
        </div>

        {c.mode === "delivery" && c.status !== "cancelled" && <DeliveryForm id={c.id} fee={c.delivery_fee} courier={c.courier_name} />}

        <div>
          <p className="text-label-sm text-texte/55 uppercase">Progression</p>
          <ol className="mt-2 flex flex-col gap-2 border-l border-ligne pl-4">
            {historique.map((h, i) => (
              <li key={h.changed_at + h.status} className="relative">
                <span className={`absolute top-1.5 -left-[21px] size-2.5 rounded-full ${i === historique.length - 1 ? "bg-or ring-4 ring-or/20" : "bg-ligne"}`} />
                <span className="text-body-sm text-ivoire">{orderStatusLabel[h.status]}</span>
                <span className="ml-2 text-body-sm text-texte/50">{heureAbidjan(h.changed_at)}</span>
              </li>
            ))}
          </ol>
        </div>

        {orderTransitions(c.status, c.mode).length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-ligne pt-4">
            {orderTransitions(c.status, c.mode).map((t) => (
              <ActionButton
                key={t.to}
                tone={t.tone}
                className={t.tone === "primaire" ? "flex-1" : ""}
                confirm={t.to === "cancelled" ? `Annuler la commande n° ${c.number} ? Pensez à prévenir le client.` : undefined}
                action={changeOrderStatus.bind(null, c.id, t.to)}
              >
                {t.label}
              </ActionButton>
            ))}
          </div>
        )}
        <Link href={`/commande?suivi=${c.token}`} target="_blank" className="text-center text-label-sm text-texte/50 hover:text-or">
          Voir la page de suivi du client ↗
        </Link>
      </div>
    </section>
  );
}
