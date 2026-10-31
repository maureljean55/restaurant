import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/admin/client";
import { EmptyState, Kpi, OrderBadge, PageHeader, Panel, ReservationBadge } from "@/components/admin/ui";
import { aujourdhuiIso, dateAbidjan, debutDuJour, heureAbidjan, ilYA, requireStaff } from "@/lib/admin/session";
import { ACTIVE_ORDER, minutesBetween, orderStatusLabel, type OrderStatus, type ReservationStatus } from "@/lib/domain/workflow";
import { formatFCFA } from "@/lib/format";
import { IconBike, IconCalendar, IconCarte, IconChef, IconClock, IconReceipt, IconTrend, IconUsers } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function TableauDeBordPage() {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement du tableau de bord…</p>}>
      <TableauDeBord />
    </Suspense>
  );
}

type Commande = { id: string; number: number; status: OrderStatus; mode: "pickup" | "delivery"; subtotal: number; delivery_fee: number | null; payment_status: "paid" | "unpaid"; created_at: string; name: string };

async function TableauDeBord() {
  const { membre, db } = await requireStaff();
  const debut = debutDuJour();
  const il_y_a_30j = ilYA(30);

  const [commandes, resas, services, lignes, dernieresCommandes, dernieresResas, journal] = await Promise.all([
    db.from("orders").select("id, number, status, mode, subtotal, delivery_fee, payment_status, created_at, name").gte("created_at", debut).order("created_at").returns<Commande[]>(),
    db.from("reservations").select("guests, status, service_id").eq("date", aujourdhuiIso()).returns<{ guests: number; status: ReservationStatus; service_id: string }[]>(),
    db.from("reservation_services").select("id, label, capacity").eq("active", true).order("starts"),
    db
      .from("order_items")
      .select("name, qty, line_total, orders!inner(created_at, status)")
      .gte("orders.created_at", il_y_a_30j)
      .neq("orders.status", "cancelled")
      .returns<{ name: string; qty: number; line_total: number }[]>(),
    db.from("orders").select("id, number, name, mode, subtotal, status, created_at").order("created_at", { ascending: false }).limit(6).returns<Commande[]>(),
    db
      .from("reservations")
      .select("id, reference, name, guests, date, time, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<{ id: string; reference: string; name: string; guests: number; date: string; time: string; status: ReservationStatus; created_at: string }[]>(),
    db.from("order_status_log").select("order_id, status, changed_at").gte("changed_at", debut).in("status", ["preparing", "ready"]).returns<{ order_id: string; status: OrderStatus; changed_at: string }[]>(),
  ]);

  const jour = commandes.data ?? [];
  const valides = jour.filter((c) => c.status !== "cancelled");
  const ca = valides.reduce((s, c) => s + c.subtotal + (c.delivery_fee ?? 0), 0);
  const encaisse = valides.filter((c) => c.payment_status === "paid").reduce((s, c) => s + c.subtotal + (c.delivery_fee ?? 0), 0);
  const parStatut = (s: OrderStatus) => jour.filter((c) => c.status === s).length;

  const reservations = resas.data ?? [];
  const confirmees = reservations.filter((r) => r.status === "confirmed");
  const enAttente = reservations.filter((r) => r.status === "pending");
  const capacite = (services.data ?? []).reduce((s, x) => s + x.capacity, 0);
  const couverts = confirmees.reduce((s, r) => s + r.guests, 0);

  // Temps de préparation réel : passage « en cuisine » → « prête »
  const debuts = new Map<string, string>();
  const durees: number[] = [];
  for (const l of (journal.data ?? []).sort((a, b) => a.changed_at.localeCompare(b.changed_at))) {
    if (l.status === "preparing") debuts.set(l.order_id, l.changed_at);
    else if (debuts.has(l.order_id)) durees.push(minutesBetween(debuts.get(l.order_id)!, new Date(l.changed_at)));
  }
  const tempsCuisine = durees.length ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : null;

  // Ventes par heure (8 h → 23 h)
  const heures = Array.from({ length: 16 }, (_, i) => i + 8);
  const parHeure = heures.map((h) => valides.filter((c) => new Date(c.created_at).getUTCHours() === h).reduce((s, c) => s + c.subtotal, 0));

  // Plats les plus commandés sur 30 jours
  const top = [...(lignes.data ?? []).reduce((m, l) => m.set(l.name, { qty: (m.get(l.name)?.qty ?? 0) + l.qty, ca: (m.get(l.name)?.ca ?? 0) + l.line_total }), new Map<string, { qty: number; ca: number }>())]
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  const pipeline: { statuts: OrderStatus[]; label: string; detail: string }[] = [
    { statuts: ["received"], label: "En attente", detail: "À accepter" },
    { statuts: ["accepted", "preparing"], label: "En cuisine", detail: "Acceptées et en préparation" },
    { statuts: ["ready"], label: "Prêtes", detail: "À remettre ou à expédier" },
    { statuts: ["out_for_delivery"], label: "En livraison", detail: "Parties chez le client" },
    { statuts: ["completed"], label: "Terminées", detail: "Remises ou livrées aujourd'hui" },
  ];

  const evenements = [
    ...(dernieresCommandes.data ?? []).map((c) => ({
      at: c.created_at,
      href: `/admin/commandes?id=${c.id}`,
      type: "Commande" as const,
      titre: `N° ${c.number} · ${c.name}`,
      detail: `${c.mode === "delivery" ? "Livraison" : "À emporter"} · ${formatFCFA(c.subtotal)}`,
      badge: <OrderBadge status={c.status} />,
    })),
    ...(dernieresResas.data ?? []).map((r) => ({
      at: r.created_at,
      href: `/admin/reservations?date=${r.date}`,
      type: "Réservation" as const,
      titre: `${r.name} · ${r.guests} pers.`,
      detail: `${dateAbidjan(`${r.date}T12:00:00Z`, { weekday: "short", day: "numeric", month: "short" })} à ${r.time.slice(0, 5).replace(":", "h")} · ${r.reference}`,
      badge: <ReservationBadge status={r.status} />,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7);

  const actives = jour.filter((c) => ACTIVE_ORDER.includes(c.status));

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow={`Bonjour ${membre.name} · ${dateAbidjan(new Date().toISOString())}`}
        title="Tableau de bord"
        description="Activité du jour en temps réel : commandes, cuisine, livraisons et réservations."
        actions={<AutoRefresh secondes={30} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi accent label="Chiffre d'affaires du jour" value={ca.toLocaleString("fr-FR")} unit="FCFA" hint={`Encaissé : ${formatFCFA(encaisse)}`} icon={<IconTrend width={18} height={18} />} />
        <Kpi
          label="Commandes du jour"
          value={valides.length}
          hint={`${actives.length} en cours · ${parStatut("completed")} terminée${parStatut("completed") > 1 ? "s" : ""} · ${parStatut("cancelled")} annulée${parStatut("cancelled") > 1 ? "s" : ""}`}
          icon={<IconReceipt width={18} height={18} />}
        />
        <Kpi
          label="Réservations du jour"
          value={confirmees.length}
          unit={`/ ${couverts} couvert${couverts > 1 ? "s" : ""}`}
          hint={`${enAttente.length} en attente · capacité ${capacite} couverts`}
          icon={<IconUsers width={18} height={18} />}
        />
        <Kpi label="Panier moyen" value={valides.length ? Math.round(ca / valides.length).toLocaleString("fr-FR") : "—"} unit={valides.length ? "FCFA" : undefined} hint={tempsCuisine === null ? "Temps cuisine : pas encore mesuré" : `Temps cuisine moyen : ${tempsCuisine} min`} icon={<IconClock width={18} height={18} />} />
      </div>

      <Panel eyebrow="En direct" title="Suivi des commandes du jour">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {pipeline.map((p, i) => {
            const n = jour.filter((c) => p.statuts.includes(c.status)).length;
            return (
              <Link key={p.label} href={`/admin/commandes?statut=${p.statuts[0]}`} className="group rounded-lg border border-ligne bg-surface-basse p-3 transition-colors hover:border-or/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label-sm text-texte/70 uppercase">
                    {i + 1}. {p.label}
                  </span>
                  <span className={`prix grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-label-sm ${n ? "bg-or text-noir" : "bg-surface-haute text-texte/50"}`}>{n}</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-surface-haute">
                  <div className="h-full rounded-full bg-or transition-[width]" style={{ width: `${jour.length ? Math.max(n ? 8 : 0, (n / jour.length) * 100) : 0}%` }} />
                </div>
                <p className="mt-2 text-[12px] text-texte/50 group-hover:text-texte/70">{p.detail}</p>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
          <Panel eyebrow="Ventes par heure" title="Évolution des recettes (8 h – 23 h)">
            {ca === 0 ? (
              <EmptyState title="Aucune vente aujourd'hui pour l'instant" icon={<IconTrend width={22} height={22} />}>
                La courbe se dessine au fil des commandes de la journée.
              </EmptyState>
            ) : (
              <CourbeVentes heures={heures} valeurs={parHeure} />
            )}
            {valides.length > 0 && (
              <div className="mt-5 rounded-lg bg-surface-basse p-3">
                <div className="flex justify-between text-label-sm text-texte/60 uppercase">
                  <span>Répartition des commandes</span>
                  <span>{valides.length} commandes</span>
                </div>
                {(() => {
                  const liv = valides.filter((c) => c.mode === "delivery").length;
                  const pct = Math.round((liv / valides.length) * 100);
                  return (
                    <>
                      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-haute">
                        <div className="bg-or" style={{ width: `${100 - pct}%` }} />
                        <div className="bg-champagne/50" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-body-sm text-texte/75">
                        <span>
                          <span className="mr-1.5 inline-block size-2 rounded-full bg-or" />À emporter {100 - pct} %
                        </span>
                        <span>
                          <span className="mr-1.5 inline-block size-2 rounded-full bg-champagne/50" />
                          Livraison {pct} %
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </Panel>

          <Panel eyebrow="30 derniers jours" title="Plats les plus commandés">
            {top.length === 0 ? (
              <EmptyState title="Pas encore de commandes sur la période" icon={<IconCarte width={22} height={22} />} />
            ) : (
              <ol className="flex flex-col gap-2">
                {top.map(([nom, v], i) => (
                  <li key={nom} className="flex items-center gap-4 rounded-lg bg-surface-basse px-4 py-3">
                    <span className="font-display text-title text-or/80">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-md text-ivoire">{nom}</span>
                      <span className="text-body-sm text-texte/55">{formatFCFA(v.ca)} de ventes</span>
                    </span>
                    <span className="text-right">
                      <span className="prix block font-display text-headline-sm text-or">{v.qty}</span>
                      <span className="text-label-sm text-texte/50 uppercase">portions</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4 lg:gap-8">
          <Panel eyebrow="Activité" title="Dernières entrées">
            {evenements.length === 0 ? (
              <EmptyState title="Aucune commande ni réservation pour l'instant" />
            ) : (
              <ul className="flex flex-col gap-2">
                {evenements.map((e) => (
                  <li key={e.type + e.href + e.at}>
                    <Link href={e.href} className="block rounded-lg border border-ligne bg-surface-basse p-3 transition-colors hover:border-or/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-label-sm text-or uppercase">
                          {e.type === "Commande" ? <IconReceipt width={14} height={14} /> : <IconCalendar width={14} height={14} />}
                          {e.type}
                        </span>
                        <span className="text-label-sm text-texte/45">
                          {e.at >= debut ? heureAbidjan(e.at) : dateAbidjan(e.at, { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-body-md text-ivoire">{e.titre}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-body-sm text-texte/55">{e.detail}</span>
                        {e.badge}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel eyebrow="Accès rapides" title="Postes">
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/cuisine", label: "Cuisine (KDS)", Icon: IconChef, info: `${jour.filter((c) => ["accepted", "preparing"].includes(c.status)).length} ticket(s) en cours` },
                { href: "/admin/livraisons", label: "Livraisons", Icon: IconBike, info: `${jour.filter((c) => c.mode === "delivery" && ["ready", "out_for_delivery"].includes(c.status)).length} à suivre` },
                { href: "/admin/reservations", label: "Réservations", Icon: IconCalendar, info: `${enAttente.length} en attente aujourd'hui` },
                { href: "/admin/carte", label: "Carte & 3D", Icon: IconCarte, info: "Prix et disponibilités" },
              ].map(({ href, label, Icon, info }) => (
                <Link key={href} href={href} className="rounded-lg border border-ligne bg-surface-basse p-3 transition-colors hover:border-or/60">
                  <Icon width={20} height={20} className="text-or" />
                  <p className="mt-2 text-body-md font-semibold text-ivoire">{label}</p>
                  <p className="text-[12px] text-texte/55">{info}</p>
                </Link>
              ))}
            </div>
          </Panel>
          <p className="text-[12px] text-texte/45">
            Statuts : {Object.values(orderStatusLabel).join(" → ")}. Paiement en V1 : sur place ou à la livraison.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Courbe des recettes horaires (SVG, sans bibliothèque). */
function CourbeVentes({ heures, valeurs }: { heures: number[]; valeurs: number[] }) {
  const W = 640, H = 200, P = 8;
  const max = Math.max(...valeurs, 1);
  const x = (i: number) => P + (i / (valeurs.length - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - (v / max) * (H - 2 * P - 16);
  const ligne = valeurs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const pic = valeurs.indexOf(max);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" role="img" aria-label={`Recettes par heure, pic à ${heures[pic]} h (${formatFCFA(max)})`}>
        <defs>
          <linearGradient id="aire" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-or)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--color-or)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={P} x2={W - P} y1={y(max * f)} y2={y(max * f)} stroke="var(--color-ligne)" strokeDasharray="3 5" />
        ))}
        <path d={`${ligne} L${x(valeurs.length - 1)},${H - P} L${x(0)},${H - P} Z`} fill="url(#aire)" />
        <path d={ligne} fill="none" stroke="var(--color-or)" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x(pic)} cy={y(max)} r="5" fill="var(--color-or)" />
        <text x={Math.min(Math.max(x(pic), 60), W - 60)} y={y(max) - 10} textAnchor="middle" fontSize="12" fill="var(--color-champagne)">
          {heures[pic]} h · {formatFCFA(max)}
        </text>
        {heures.map((h, i) =>
          i % 2 === 0 ? (
            <text key={h} x={x(i)} y={H + 14} textAnchor="middle" fontSize="11" fill="var(--color-texte)" opacity="0.5">
              {h}h
            </text>
          ) : null,
        )}
      </svg>
    </figure>
  );
}
