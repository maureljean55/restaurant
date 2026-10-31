import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActionButton, AutoRefresh, Elapsed } from "@/components/admin/client";
import { DeliveryForm } from "@/components/admin/DeliveryForm";
import { EmptyState, formatPhone, Kpi, OrderBadge, PageHeader, telHref, whatsappHref } from "@/components/admin/ui";
import { changeOrderStatus } from "@/lib/actions/admin";
import { debutDuJour, heureAbidjan, requireStaff } from "@/lib/admin/session";
import { minutesBetween, type OrderStatus } from "@/lib/domain/workflow";
import { formatFCFA } from "@/lib/format";
import { IconBike, IconChat, IconPhone, IconPin } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Livraisons" };

type Livraison = {
  id: string;
  number: number;
  status: OrderStatus;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  delivery_fee: number | null;
  payment_status: "paid" | "unpaid";
  courier_name: string | null;
  created_at: string;
  order_items: { qty: number }[];
  order_status_log: { status: OrderStatus; changed_at: string }[];
};

export default function LivraisonsPage() {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement des livraisons…</p>}>
      <Livraisons />
    </Suspense>
  );
}

async function Livraisons() {
  const { db } = await requireStaff();
  const { data } = await db
    .from("orders")
    .select("id, number, status, name, phone, address, note, subtotal, delivery_fee, payment_status, courier_name, created_at, order_items(qty), order_status_log(status, changed_at)")
    .eq("mode", "delivery")
    .or(`status.in.(received,accepted,preparing,ready,out_for_delivery),and(status.eq.completed,created_at.gte.${debutDuJour()})`)
    .order("created_at")
    .returns<Livraison[]>();
  const liste = data ?? [];
  const quand = (l: Livraison, s: OrderStatus) => l.order_status_log.filter((x) => x.status === s).at(-1)?.changed_at;

  // Durée réelle des livraisons du jour : départ → livrée
  const durees = liste
    .filter((l) => l.status === "completed" && quand(l, "out_for_delivery") && quand(l, "completed"))
    .map((l) => minutesBetween(quand(l, "out_for_delivery")!, new Date(quand(l, "completed")!)));
  const livrees = liste.filter((l) => l.status === "completed");
  const caLivraison = livrees.reduce((s, l) => s + l.subtotal + (l.delivery_fee ?? 0), 0);

  const colonnes: { titre: string; statuts: OrderStatus[]; vide: string }[] = [
    { titre: "En cuisine", statuts: ["received", "accepted", "preparing"], vide: "Aucune livraison en préparation" },
    { titre: "Prêtes à partir", statuts: ["ready"], vide: "Rien à expédier" },
    { titre: "En route", statuts: ["out_for_delivery"], vide: "Aucun livreur en course" },
    { titre: "Livrées aujourd'hui", statuts: ["completed"], vide: "Pas encore de livraison terminée" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Opérations · livraison"
        title="Suivi des livraisons"
        description="Attribuez un livreur, fixez les frais, puis suivez le départ et la remise au client."
        actions={<AutoRefresh secondes={20} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="En route" value={liste.filter((l) => l.status === "out_for_delivery").length} hint="Courses en cours" icon={<IconBike width={18} height={18} />} />
        <Kpi label="À expédier" value={liste.filter((l) => l.status === "ready").length} hint={`${liste.filter((l) => ["received", "accepted", "preparing"].includes(l.status)).length} encore en cuisine`} />
        <Kpi label="Durée moyenne de course" value={durees.length ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : "—"} unit={durees.length ? "min" : undefined} hint="Départ → livrée, aujourd'hui" />
        <Kpi accent label="Livraisons du jour" value={caLivraison.toLocaleString("fr-FR")} unit="FCFA" hint={`${livrees.length} livrée(s)`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        {colonnes.map((col) => {
          const items = liste.filter((l) => col.statuts.includes(l.status));
          return (
            <section key={col.titre} aria-label={col.titre} className="flex flex-col gap-3">
              <h2 className="flex items-center justify-between border-b border-ligne pb-2 text-label-lg text-champagne uppercase">
                {col.titre} <span className="prix text-or">{items.length}</span>
              </h2>
              {items.length === 0 ? (
                <EmptyState title={col.vide} />
              ) : (
                items.map((l) => {
                  const depart = quand(l, "out_for_delivery");
                  return (
                    <article key={l.id} className="rounded-xl border border-ligne bg-surface p-4 shadow-carte">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/commandes?id=${l.id}`} className="prix font-display text-title text-or hover:underline">
                          #{l.number}
                        </Link>
                        <OrderBadge status={l.status} />
                      </div>
                      <p className="mt-1 text-body-md text-ivoire">{l.name}</p>
                      <p className="mt-1 flex items-start gap-1.5 text-body-sm text-texte/70">
                        <IconPin width={14} height={14} className="mt-0.5 shrink-0 text-or" />
                        {l.address ?? "Adresse manquante"}
                      </p>
                      {l.note && <p className="mt-1 text-body-sm text-champagne italic">« {l.note} »</p>}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-basse px-3 py-2 text-body-sm">
                        <span className="text-texte/65">
                          {l.order_items.reduce((s, i) => s + i.qty, 0)} article(s) · {l.payment_status === "paid" ? "payée" : "à encaisser"}
                        </span>
                        <span className="prix text-ivoire">
                          {formatFCFA(l.subtotal + (l.delivery_fee ?? 0))}
                          {l.delivery_fee === null && <span className="text-texte/45"> + frais</span>}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] text-texte/50">
                        Commandée à {heureAbidjan(l.created_at)}
                        {depart && (
                          <>
                            {" "}
                            · partie à {heureAbidjan(depart)}
                            {l.status === "out_for_delivery" && (
                              <>
                                {" "}
                                (<Elapsed since={depart} alertAfter={45} />)
                              </>
                            )}
                          </>
                        )}
                        {l.courier_name && <> · livreur : {l.courier_name}</>}
                      </p>
                      {["ready", "preparing", "accepted", "received"].includes(l.status) && (
                        <div className="mt-3">
                          <DeliveryForm id={l.id} fee={l.delivery_fee} courier={l.courier_name} compact />
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={telHref(l.phone)} aria-label={`Appeler ${l.name}`} className="grid size-9 place-items-center rounded-full border border-ligne text-texte hover:border-or hover:text-or">
                          <IconPhone width={15} height={15} />
                        </a>
                        <a
                          href={whatsappHref(l.phone, `Bonjour ${l.name}, votre commande LE-TCHE n° ${l.number} est en route.`)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp ${l.name} (${formatPhone(l.phone)})`}
                          className="grid size-9 place-items-center rounded-full border border-ligne text-texte hover:border-or hover:text-or"
                        >
                          <IconChat width={15} height={15} />
                        </a>
                        {l.status === "ready" && (
                          <ActionButton className="flex-1" action={changeOrderStatus.bind(null, l.id, "out_for_delivery")}>
                            <IconBike width={16} height={16} /> Valider le départ
                          </ActionButton>
                        )}
                        {l.status === "out_for_delivery" && (
                          <ActionButton className="flex-1" action={changeOrderStatus.bind(null, l.id, "completed")}>
                            Livrée
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
        Zones et frais de livraison : à définir avec le restaurant. En attendant, les frais sont saisis commande par commande et affichés au client sur sa page de suivi.
      </p>
    </div>
  );
}
