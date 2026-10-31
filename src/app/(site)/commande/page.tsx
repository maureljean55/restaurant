import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/config/site";
import { getOrderByToken, type OrderStatus } from "@/lib/orders";
import { formatFCFA } from "@/lib/format";
import { btn } from "@/components/ui/styles";
import { IconCheck, IconInfo, IconPhone } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Suivi de commande",
  // Lien personnel : jamais indexé
  robots: { index: false, follow: false },
};

const etapes: Record<"pickup" | "delivery", { status: OrderStatus[]; label: string }[]> = {
  pickup: [
    { status: ["received"], label: "Reçue" },
    { status: ["accepted", "preparing"], label: "En préparation" },
    { status: ["ready"], label: "Prête à retirer" },
    { status: ["completed"], label: "Retirée" },
  ],
  delivery: [
    { status: ["received"], label: "Reçue" },
    { status: ["accepted", "preparing", "ready"], label: "En préparation" },
    { status: ["out_for_delivery"], label: "En livraison" },
    { status: ["completed"], label: "Livrée" },
  ],
};

const messages: Record<OrderStatus, string> = {
  received: "Le restaurant a bien reçu votre commande et va la confirmer.",
  accepted: "Commande acceptée : elle passe en cuisine.",
  preparing: "Votre commande est en cours de préparation.",
  ready: "Votre commande est prête.",
  out_for_delivery: "Votre commande est en route.",
  completed: "Commande terminée. Bon appétit !",
  cancelled: "Cette commande a été annulée. Contactez le restaurant pour plus d'informations.",
};

export default function SuiviPage({ searchParams }: PageProps<"/commande">) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16 md:px-8 md:pt-8 lg:pb-24">
      <Suspense fallback={<p className="mt-10 text-center text-body-md text-cacao/60">Chargement de votre commande…</p>}>
        <Suivi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Suivi({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { suivi } = await searchParams;
  const o = typeof suivi === "string" ? await getOrderByToken(suivi) : null;

  if (!o) {
    return (
      <div className="mt-10 text-center">
        <h1 className="text-headline-sm text-cacao">Commande introuvable</h1>
        <p className="mx-auto mt-2 max-w-sm text-body-md text-cacao/70">
          Ce lien de suivi n&apos;est pas valide. Vérifiez qu&apos;il est complet ou contactez le restaurant.
        </p>
        <Link href="/menu" className={`${btn.primary} ${btn.md} mt-5`}>
          Voir la carte
        </Link>
      </div>
    );
  }

  const liste = etapes[o.mode];
  const courante = liste.findIndex((e) => e.status.includes(o.status));
  const annulee = o.status === "cancelled";

  return (
    <>
      <p className="surtitre text-terracotta">Suivi de commande</p>
      <h1 className="mt-1 text-headline-lg-mobile text-cacao md:text-headline-lg">
        Commande <span className="prix">n° {o.number}</span>
      </h1>
      <p className="mt-1 text-body-sm text-cacao/65">
        {o.mode === "pickup" ? "À emporter" : "Livraison"} · passée le{" "}
        {new Date(o.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
      </p>

      <section className="mt-6 rounded-xl border border-sable/70 bg-blanc p-5 shadow-carte" aria-label="État de la commande">
        <p className={`text-body-md ${annulee ? "text-terracotta" : "text-vert"} font-semibold`} role="status">
          {messages[o.status]}
        </p>
        {!annulee && (
          <ol className="mt-5 grid grid-cols-4 gap-1">
            {liste.map((e, i) => {
              const faite = i <= courante;
              return (
                <li key={e.label} className="flex flex-col items-center text-center" aria-current={i === courante ? "step" : undefined}>
                  <span className="flex w-full items-center">
                    <span className={`h-0.5 flex-1 ${i === 0 ? "invisible" : faite ? "bg-vert" : "bg-sable"}`} />
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${faite ? "bg-vert text-ivoire" : "border-2 border-sable bg-blanc text-cacao/40"}`}>
                      {faite ? <IconCheck width={16} height={16} /> : <span className="text-label-sm">{i + 1}</span>}
                    </span>
                    <span className={`h-0.5 flex-1 ${i === liste.length - 1 ? "invisible" : i < courante ? "bg-vert" : "bg-sable"}`} />
                  </span>
                  <span className={`mt-2 text-label-sm ${faite ? "text-cacao" : "text-cacao/50"}`}>{e.label}</span>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-5 flex gap-2 text-[12px] text-cacao/60">
          <IconInfo width={14} height={14} className="mt-0.5 shrink-0" />
          Rechargez la page pour voir l&apos;état à jour. Gardez ce lien : c&apos;est votre seul accès au suivi.
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-sable/70 bg-blanc p-5 shadow-carte" aria-label="Détail">
        <ul className="divide-y divide-sable/60">
          {o.order_items.map((l) => (
            <li key={l.name} className="flex justify-between gap-3 py-2 text-body-md">
              <span>
                <span className="prix text-cacao/60">{l.qty} ×</span> {l.name}
              </span>
              <span className="prix shrink-0">{formatFCFA(l.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-sable pt-3 font-display text-title text-vert">
          <span>{o.mode === "delivery" && o.delivery_fee == null ? "Total hors livraison" : "Total"}</span>
          <span className="prix">{formatFCFA(o.subtotal + (o.delivery_fee ?? 0))}</span>
        </div>
        {o.mode === "delivery" && (
          <p className="mt-1 text-body-sm text-cacao/60">
            Livraison : {o.delivery_fee == null ? "frais confirmés par le restaurant" : formatFCFA(o.delivery_fee)}
            {o.address && <> · {o.address}</>}
          </p>
        )}
        <p className="mt-1 text-body-sm text-cacao/60">
          Paiement {o.mode === "delivery" ? "à la livraison" : "au retrait"} · {o.payment_status === "paid" ? "réglé" : "à régler"}
        </p>
      </section>

      <p className="mt-6 flex items-center justify-center gap-2 text-body-sm text-cacao/65">
        <IconPhone width={16} height={16} /> Une question ? {site.phone.value}
      </p>
    </>
  );
}
