import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActionButton, AutoRefresh } from "@/components/admin/client";
import { compteurClasse, EmptyState, formatPhone, Kpi, ongletClasse, PageHeader, Panel, ReservationBadge, telHref, whatsappHref } from "@/components/admin/ui";
import { changeReservationStatus } from "@/lib/actions/admin";
import { aujourdhuiIso, dateAbidjan, requireStaff } from "@/lib/admin/session";
import { getCatalogue } from "@/lib/catalogue/server";
import { reservationTransitions, type ReservationStatus } from "@/lib/domain/workflow";
import { IconCalendar, IconChat, IconChevron, IconMoon, IconPhone, IconSun, IconUsers } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Salle & réservations" };

type Resa = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  guests: number;
  date: string;
  time: string;
  service_id: string;
  zone: string | null;
  comment: string | null;
  status: ReservationStatus;
  created_at: string;
};

const FILTRES = [
  { id: "toutes", label: "Toutes", statuts: ["pending", "confirmed", "declined", "cancelled"] },
  { id: "pending", label: "En attente", statuts: ["pending"] },
  { id: "confirmed", label: "Confirmées", statuts: ["confirmed"] },
  { id: "autres", label: "Refusées / annulées", statuts: ["declined", "cancelled"] },
] as const;

export default function ReservationsPage({ searchParams }: PageProps<"/admin/reservations">) {
  return (
    <Suspense fallback={<p className="text-body-md text-texte/60">Chargement des réservations…</p>}>
      <Reservations searchParams={searchParams} />
    </Suspense>
  );
}

const decaler = (iso: string, jours: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
};
const h = (t: string) => t.slice(0, 5).replace(":", "h");

async function Reservations({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { db } = await requireStaff();
  const sp = await searchParams;
  const aujourdhui = aujourdhuiIso();
  const date = typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : aujourdhui;
  const filtre = FILTRES.find((f) => f.id === sp.filtre) ?? FILTRES[0];

  const champs = "id, reference, name, phone, email, guests, date, time, service_id, zone, comment, status, created_at";
  const [duJour, aTraiter, services, { settings }] = await Promise.all([
    db.from("reservations").select(champs).eq("date", date).order("time").returns<Resa[]>(),
    db.from("reservations").select(champs).eq("status", "pending").gte("date", aujourdhui).order("date").order("time").limit(12).returns<Resa[]>(),
    db.from("reservation_services").select("id, label, starts, ends, capacity").eq("active", true).order("starts").returns<{ id: string; label: string; starts: string; ends: string; capacity: number }[]>(),
    getCatalogue(),
  ]);

  const resas = duJour.data ?? [];
  const actives = resas.filter((r) => r.status === "pending" || r.status === "confirmed");
  const capacite = (services.data ?? []).reduce((s, x) => s + x.capacity, 0);
  const couverts = (statut: ReservationStatus) => resas.filter((r) => r.status === statut).reduce((s, r) => s + r.guests, 0);
  const occupation = capacite ? Math.round((actives.reduce((s, r) => s + r.guests, 0) / capacite) * 100) : 0;
  const zone = (id: string | null) => settings.zones.find((z) => z.id === id)?.label ?? "Sans préférence";
  const lien = (p: Record<string, string>) => `/admin/reservations?${new URLSearchParams({ date, filtre: filtre.id, ...p })}`;
  const libelleDate = date === aujourdhui ? "Aujourd'hui" : date === decaler(aujourdhui, 1) ? "Demain" : dateAbidjan(`${date}T12:00:00Z`);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Opérations de salle"
        title="Réservations & capacité"
        description="Confirmez ou refusez chaque demande. Une réservation n'est jamais confirmée automatiquement."
        actions={<AutoRefresh secondes={30} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={`Confirmées · ${libelleDate.toLowerCase()}`} value={resas.filter((r) => r.status === "confirmed").length} unit={`/ ${couverts("confirmed")} couverts`} icon={<IconUsers width={18} height={18} />} />
        <Kpi label="En attente ce jour" value={resas.filter((r) => r.status === "pending").length} unit={`/ ${couverts("pending")} couverts`} />
        <Kpi label="Taux d'occupation" value={`${occupation} %`} hint={`Confirmées + en attente sur ${capacite} couverts`} />
        <Kpi accent label="Demandes à traiter" value={aTraiter.data?.length ?? 0} hint="Toutes dates à venir" icon={<IconCalendar width={18} height={18} />} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={lien({ date: decaler(date, -1) })} aria-label="Jour précédent" className="verre-survol grid size-10 place-items-center rounded-full border border-ligne text-or">
            <IconChevron width={16} height={16} className="rotate-180" />
          </Link>
          <form action="/admin/reservations" className="flex items-center gap-2">
            <input type="hidden" name="filtre" value={filtre.id} />
            <label className="sr-only" htmlFor="jour">
              Date
            </label>
            <input id="jour" name="date" type="date" defaultValue={date} className="h-10 w-36 rounded-lg border border-ligne bg-surface px-2.5 text-body-sm text-texte [color-scheme:dark]" />
            <button className="h-10 rounded-full border border-or/60 px-3 text-label-md text-or uppercase">Voir</button>
          </form>
          <Link href={lien({ date: decaler(date, 1) })} aria-label="Jour suivant" className="verre-survol grid size-10 place-items-center rounded-full border border-ligne text-or">
            <IconChevron width={16} height={16} />
          </Link>
          {date !== aujourdhui && (
            <Link href={lien({ date: aujourdhui })} className="text-label-md text-or underline">
              Aujourd&apos;hui
            </Link>
          )}
        </div>
        <p className="font-display text-headline-sm text-ivoire first-letter:uppercase">{libelleDate}</p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex w-max gap-2">
          {FILTRES.map((f) => (
            <Link key={f.id} href={lien({ filtre: f.id })} className={ongletClasse(f.id === filtre.id)}>
              {f.label} <span className={compteurClasse(f.id === filtre.id)}>{resas.filter((r) => (f.statuts as readonly string[]).includes(r.status)).length}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          {(services.data ?? []).map((s) => {
            const duService = resas.filter((r) => r.service_id === s.id);
            const visibles = duService.filter((r) => (filtre.statuts as readonly string[]).includes(r.status));
            const conf = duService.filter((r) => r.status === "confirmed").reduce((a, r) => a + r.guests, 0);
            const att = duService.filter((r) => r.status === "pending").reduce((a, r) => a + r.guests, 0);
            return (
              <Panel
                key={s.id}
                eyebrow={`${h(s.starts)} – ${h(s.ends)}`}
                title={s.label}
                actions={
                  <span className="text-right text-body-sm text-texte/70">
                    <span className="prix font-display text-title text-or">{conf + att}</span> / {s.capacity} couverts
                    <span className="block text-[12px] text-texte/50">
                      {conf} confirmés · {att} en attente · {Math.max(0, s.capacity - conf - att)} libres
                    </span>
                  </span>
                }
              >
                <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-surface-haute" aria-hidden>
                  <div className="bg-succes" style={{ width: `${Math.min(100, (conf / s.capacity) * 100)}%` }} />
                  <div className="bg-or" style={{ width: `${Math.min(100, (att / s.capacity) * 100)}%` }} />
                </div>
                {visibles.length === 0 ? (
                  <EmptyState title="Aucune réservation" icon={s.id === "diner" ? <IconMoon width={20} height={20} /> : <IconSun width={20} height={20} />} />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {visibles.map((r) => (
                      <Carte key={r.id} r={r} zone={zone(r.zone)} />
                    ))}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>

        <Panel eyebrow="Toutes dates" title="Demandes à traiter" className="self-start xl:col-span-4">
          {(aTraiter.data ?? []).length === 0 ? (
            <EmptyState title="Tout est traité">Les nouvelles demandes apparaîtront ici.</EmptyState>
          ) : (
            <ul className="flex flex-col gap-2">
              {(aTraiter.data ?? []).map((r) => (
                <li key={r.id} className="rounded-lg border border-ligne bg-surface-basse p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={lien({ date: r.date, filtre: "toutes" })} className="text-body-sm font-semibold text-or hover:underline first-letter:uppercase">
                      {dateAbidjan(`${r.date}T12:00:00Z`, { weekday: "short", day: "numeric", month: "short" })} · {h(r.time)}
                    </Link>
                    <span className="text-label-sm text-texte/45">{r.reference}</span>
                  </div>
                  <p className="mt-1 text-body-md text-ivoire">
                    {r.name} · {r.guests} pers.
                  </p>
                  <div className="mt-2 flex gap-2">
                    {reservationTransitions(r.status).map((t) => (
                      <ActionButton key={t.to} size="sm" tone={t.tone} className="flex-1" action={changeReservationStatus.bind(null, r.id, t.to)}>
                        {t.label}
                      </ActionButton>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Carte({ r, zone }: { r: Resa; zone: string }) {
  const quand = `${dateAbidjan(`${r.date}T12:00:00Z`, { weekday: "long", day: "numeric", month: "long" })} à ${h(r.time)}`;
  const messages: Partial<Record<ReservationStatus, string>> = {
    confirmed: `Bonjour ${r.name}, votre réservation chez LE-TCHE le ${quand} pour ${r.guests} personne(s) est confirmée. À bientôt ! (Réf. ${r.reference})`,
    declined: `Bonjour ${r.name}, nous sommes désolés : nous ne pouvons pas vous accueillir le ${quand}. N'hésitez pas à choisir un autre moment. (Réf. ${r.reference})`,
  };
  return (
    <article className={`flex flex-col rounded-xl border bg-surface-basse p-4 ${r.status === "pending" ? "border-or/50" : "border-ligne"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="prix font-display text-headline-sm text-or">{h(r.time)}</p>
          <p className="text-title text-ivoire">{r.name}</p>
        </div>
        <ReservationBadge status={r.status} />
      </div>
      <p className="mt-1 text-body-sm text-texte/65">
        {r.guests} personne{r.guests > 1 ? "s" : ""} · {zone} · {r.reference}
      </p>
      <p className="prix text-body-sm text-texte/65">
        +225 {formatPhone(r.phone)}
        {r.email && <> · {r.email}</>}
      </p>
      {r.comment && <p className="mt-2 rounded-lg border border-champagne/25 bg-champagne/5 p-2.5 text-body-sm text-texte italic">« {r.comment} »</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <a href={telHref(r.phone)} aria-label={`Appeler ${r.name}`} className="grid size-9 place-items-center rounded-full border border-ligne text-texte hover:border-or hover:text-or">
          <IconPhone width={15} height={15} />
        </a>
        <a
          href={whatsappHref(r.phone, messages[r.status] ?? `Bonjour ${r.name}, au sujet de votre réservation chez LE-TCHE (réf. ${r.reference})…`)}
          target="_blank"
          rel="noreferrer"
          title={r.status === "confirmed" ? "Envoyer la confirmation par WhatsApp" : "Écrire sur WhatsApp"}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ligne px-3 text-label-md text-texte hover:border-or hover:text-or"
        >
          <IconChat width={15} height={15} /> {r.status === "confirmed" ? "Prévenir" : r.status === "declined" ? "Prévenir" : "WhatsApp"}
        </a>
        {reservationTransitions(r.status).map((t) => (
          <ActionButton
            key={t.to}
            size="sm"
            tone={t.tone}
            confirm={t.to === "cancelled" ? `Annuler la réservation de ${r.name} ?` : undefined}
            action={changeReservationStatus.bind(null, r.id, t.to)}
          >
            {t.label}
          </ActionButton>
        ))}
      </div>
    </article>
  );
}
