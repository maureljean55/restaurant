"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { createReservation } from "@/lib/actions/reservation";
import { reservation, site } from "@/config/site";
import { demoAmbiance } from "@/data/demo-dishes";
import { buildCalendar, reservationSchema, slotIsPast, type ReservationInput } from "@/lib/domain/reservation";
import { btn, pastille } from "@/components/ui/styles";
import { IconCalendar, IconCheck, IconClock, IconInfo, IconMoon, IconPhone, IconPin, IconShield, IconSun, IconUsers } from "@/components/ui/icons";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const libelleConvives: Record<number, string> = { 1: "Solo", 2: "Duo", 3: "Trio", 4: "Amis", 6: "Table", 8: "Groupe" };

type Erreurs = Partial<Record<keyof ReservationInput, string>>;

function Etape({ n, titre, icone, aside, erreur, children }: { n: number; titre: string; icone: ReactNode; aside?: ReactNode; erreur?: string; children: ReactNode }) {
  return (
    <fieldset className={`rounded-xl bg-surface-basse p-4 shadow-carte sm:p-5 ${erreur ? "ring-1 ring-erreur" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <legend className="flex items-center gap-2 text-label-lg text-or">
          <span className="text-champagne">{icone}</span>
          {n}. {titre}
        </legend>
        {aside}
      </div>
      {children}
      {erreur && (
        <p role="alert" className="mt-2 text-body-sm text-champagne">
          {erreur}
        </p>
      )}
    </fieldset>
  );
}

const choix = (actif: boolean, desactive = false) =>
  `rounded-lg text-label-md transition-colors ${
    desactive
      ? "cursor-not-allowed bg-surface-haute/60 text-texte/30"
      : actif
        ? "bg-or text-noir shadow-sm"
        : "bg-surface text-texte shadow-[0_1px_2px_rgb(74_46_36/0.08)] hover:bg-surface-haute"
  }`;

export function ReservationForm() {
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [zone, setZone] = useState(reservation.zones[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoye, setEnvoye] = useState<string | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const dialogue = useRef<HTMLDialogElement>(null);

  // La date du jour n'est connue que dans le navigateur (évite tout décalage avec le rendu serveur).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaintenant(new Date());
  }, []);

  const semaines = useMemo(
    () => (maintenant ? buildCalendar(maintenant, reservation.daysAhead, reservation.closedWeekdays) : []),
    [maintenant],
  );
  const dateChoisie = semaines.flat().find((d) => d.iso === date);
  const moisAffiche = dateChoisie?.monthLabel ?? semaines[0]?.[0]?.monthLabel ?? "";

  const resume = date
    ? `${guests} personne${guests > 1 ? "s" : ""} · ${new Date(`${date}T12:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}${time ? ` à ${time.replace(":", "h")}` : ""}`
    : `${guests} personne${guests > 1 ? "s" : ""}`;

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const res = reservationSchema.safeParse({ guests, date, time, zone, name, phone, email, comment });
    if (!res.success) {
      const errs: Erreurs = {};
      for (const issue of res.error.issues) {
        const k = issue.path[0] as keyof ReservationInput;
        errs[k] ??= issue.message;
      }
      setErreurs(errs);
      document.getElementById(`etape-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErreurs({});
    setErreurEnvoi(null);
    demarrer(async () => {
      const r = await createReservation({ guests, date, time, zone, name, phone, email, comment });
      if (!r.ok) {
        setErreurs(r.fields ?? {});
        setErreurEnvoi(r.error);
        return;
      }
      setEnvoye(r.reference);
      dialogue.current?.showModal();
    });
  }

  const champ =
    "h-11 w-full rounded-lg border border-ligne bg-surface px-3 text-body-md text-texte outline-none placeholder:text-texte/40 focus:border-or focus:ring-1 focus:ring-or";

  const photo = (
    <div className="relative h-52 overflow-hidden rounded-xl bg-surface-haute shadow-carte lg:h-64">
      <Image src={demoAmbiance.partage} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-noir/95 via-noir/40 to-transparent" aria-hidden />
      <span className={`${pastille} absolute top-3 right-3 bg-fond/85 text-texte backdrop-blur-md`}>Photo d&apos;illustration</span>
      <div className="absolute inset-x-4 bottom-4 text-ivoire">
        <p className="surtitre text-champagne">Réservation</p>
        <p className="mt-0.5 font-display text-title">{site.name.value}</p>
        <p className="mt-0.5 flex items-center gap-1 text-body-sm text-ivoire/85">
          <IconPin width={14} height={14} /> {site.address.value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-16 md:px-8 md:pt-8 lg:px-12 lg:pb-24">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-or" />
        <p className="surtitre text-champagne">Table gastronomique</p>
      </div>
      <h1 className="mt-1 text-headline-lg-mobile text-or md:text-headline-lg">Réserver votre table</h1>
      <p className="mt-1 text-body-sm text-texte/70 md:text-body-md">
        Le restaurant confirme chaque demande selon les places disponibles.
      </p>

      <form onSubmit={envoyer} noValidate className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:hidden">{photo}</div>

        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* 1. Convives */}
          <div id="etape-guests">
            <Etape
              n={1}
              titre="Nombre de convives"
              icone={<IconUsers width={18} height={18} />}
              aside={<span className={`${pastille} bg-surface-haute text-texte/75`}>{guests} pers.</span>}
              erreur={erreurs.guests}
            >
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2" role="radiogroup" aria-label="Nombre de convives">
                {reservation.guestOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={guests === n}
                    onClick={() => setGuests(n)}
                    className={`${choix(guests === n)} flex flex-col items-center py-2.5`}
                  >
                    <span className="text-label-lg">{n}</span>
                    <span className={`text-[9px] uppercase ${guests === n ? "text-champagne" : "text-texte/55"}`}>{libelleConvives[n]}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-[12px] text-texte/65">
                <IconInfo width={14} height={14} className="shrink-0 text-champagne" />
                Plus de {reservation.maxGuestsOnline} personnes ? Contactez le restaurant au {site.phone.value}.
              </p>
            </Etape>
          </div>

          {/* 2. Date */}
          <div id="etape-date">
            <Etape
              n={2}
              titre="Date"
              icone={<IconCalendar width={18} height={18} />}
              aside={<span className="text-label-sm text-champagne capitalize">{moisAffiche}</span>}
              erreur={erreurs.date}
            >
              <div className="grid grid-cols-7 gap-1 text-center">
                {JOURS.map((j) => (
                  <span key={j} className="pb-1 text-[10px] font-semibold text-texte/55 uppercase">
                    {j}
                  </span>
                ))}
                {maintenant
                  ? semaines.flat().map((d) => (
                      <button
                        key={d.iso}
                        type="button"
                        disabled={!d.bookable}
                        onClick={() => {
                          setDate(d.iso);
                          setTime("");
                        }}
                        aria-pressed={date === d.iso}
                        aria-label={new Date(`${d.iso}T12:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        className={`${choix(date === d.iso, !d.bookable)} relative h-10 sm:h-11`}
                      >
                        {d.day}
                        {d.isToday && <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-or" />}
                      </button>
                    ))
                  : Array.from({ length: 28 }, (_, i) => <span key={i} className="h-10 animate-pulse rounded-lg bg-surface-haute sm:h-11" />)}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-texte/65">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-or" /> Sélectionné</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-or" /> Aujourd&apos;hui</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-noir/20" /> Indisponible</span>
              </div>
            </Etape>
          </div>

          {/* 3. Créneau */}
          <div id="etape-time">
            <Etape n={3} titre="Service & créneau" icone={<IconClock width={18} height={18} />} erreur={erreurs.time}>
              {!date && <p className="mb-3 text-body-sm text-texte/60">Choisissez d&apos;abord une date.</p>}
              <div className="flex flex-col gap-4">
                {reservation.services.map((s) => (
                  <div key={s.id}>
                    <p className="mb-2 flex items-center gap-1.5 text-label-md text-texte">
                      {s.id === "diner" ? <IconMoon width={16} height={16} className="text-champagne" /> : <IconSun width={16} height={16} className="text-champagne" />}
                      {s.label}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {s.slots.map((slot) => {
                        const indispo = !date || (maintenant ? slotIsPast(date, slot, maintenant) : true);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={indispo}
                            aria-pressed={time === slot}
                            onClick={() => setTime(slot)}
                            className={`${choix(time === slot, indispo)} h-10`}
                          >
                            {slot.replace(":", "h")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {reservation.placeholder && (
                <p className="mt-3 text-[12px] text-texte/55">Horaires de service provisoires, à confirmer par le restaurant.</p>
              )}
            </Etape>
          </div>

          {/* 4. Zone */}
          {reservation.zones.length > 1 && (
            <Etape n={4} titre="Zone préférée" icone={<IconPin width={18} height={18} />}>
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Zone préférée">
                {reservation.zones.map((z) => (
                  <label
                    key={z.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg bg-surface p-3 shadow-[0_1px_2px_rgb(74_46_36/0.08)] ${zone === z.id ? "ring-2 ring-or" : ""}`}
                  >
                    <input type="radio" name="zone" value={z.id} checked={zone === z.id} onChange={() => setZone(z.id)} className="size-4 accent-or" />
                    <span className="flex flex-col">
                      <span className="text-label-md text-texte">{z.label}</span>
                      <span className="text-[12px] text-texte/60">{z.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Etape>
          )}

          {/* 5. Coordonnées */}
          <div id="etape-name">
            <Etape
              n={reservation.zones.length > 1 ? 5 : 4}
              titre="Vos coordonnées"
              icone={<IconPhone width={18} height={18} />}
              erreur={erreurs.name || erreurs.phone || erreurs.email}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-label-md text-texte">Nom complet *</span>
                  <input className={champ} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ex. Kouamé Aya" aria-invalid={!!erreurs.name} />
                </label>
                <label id="etape-phone">
                  <span className="mb-1 block text-label-md text-texte">Téléphone / WhatsApp *</span>
                  <span className="flex gap-2">
                    <span className="flex h-11 shrink-0 items-center rounded-lg bg-surface-haute px-3 text-label-md text-texte">+225</span>
                    <input className={champ} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="07 00 12 34 56" aria-invalid={!!erreurs.phone} />
                  </span>
                </label>
                <label id="etape-email">
                  <span className="mb-1 block text-label-md text-texte">E-mail (facultatif)</span>
                  <input className={champ} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="vous@exemple.ci" aria-invalid={!!erreurs.email} />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-label-md text-texte">Demandes particulières</span>
                  <textarea
                    className={`${champ} h-auto resize-none py-2.5`}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    placeholder="Allergies, anniversaire, chaise bébé…"
                  />
                </label>
              </div>
            </Etape>
          </div>
        </div>

        {/* Récapitulatif : colonne collante sur ordinateur, en bas sur téléphone */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-5">
          <div className="hidden lg:block">{photo}</div>
          <div className="rounded-xl border border-ligne/70 bg-surface p-4 shadow-carte sm:p-5">
            <p className="surtitre text-texte/60">Votre demande</p>
            <p className="mt-1 font-display text-title text-or first-letter:uppercase">{resume}</p>
            {zone && reservation.zones.length > 1 && (
              <p className="text-body-sm text-texte/65">{reservation.zones.find((z) => z.id === zone)?.label}</p>
            )}
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface-haute/70 p-3">
              <IconShield width={20} height={20} className="mt-0.5 shrink-0 text-champagne" />
              <p className="text-body-sm text-texte/75">
                <span className="font-semibold text-or">Conditions : </span>
                {reservation.policy}
              </p>
            </div>
            {erreurEnvoi && (
              <p role="alert" className="mt-4 rounded-lg border border-erreur/40 bg-erreur/10 p-3 text-body-sm text-champagne">
                {erreurEnvoi}
              </p>
            )}
            <button type="submit" disabled={enCours} aria-busy={enCours} className={`${btn.primary} ${btn.md} mt-4 w-full`}>
              <IconCalendar width={18} height={18} />
              {enCours ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
            <p className="mt-2 text-center text-[12px] text-texte/60">Gratuit · Le restaurant vous recontacte pour confirmer.</p>
          </div>
        </aside>
      </form>

      <dialog
        ref={dialogue}
        onClose={() => setEnvoye(null)}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-surface p-6 text-center shadow-flottant backdrop:bg-noir/50 backdrop:backdrop-blur-sm"
      >
        {envoye && (
          <div className="flex flex-col items-center">
            <span className="grid size-14 place-items-center rounded-full bg-or-sombre text-or">
              <IconCheck width={30} height={30} />
            </span>
            <p className="surtitre mt-3 text-champagne">Akwaba</p>
            <h2 className="mt-1 text-headline-sm text-or">Demande envoyée</h2>
            <p className="mt-1 text-label-md text-texte/60">
              Référence <span className="prix font-semibold text-texte">{envoye}</span>
            </p>
            <p className="mt-2 text-body-sm text-texte/75">
              <strong className="text-texte first-letter:uppercase">{resume}</strong>
              <br />
              Votre demande est <strong className="text-texte">en attente</strong> : le restaurant vous recontacte au
              numéro indiqué pour la confirmer.
            </p>
            <form method="dialog" className="mt-4 w-full">
              <button className={`${btn.secondary} ${btn.md} w-full`}>Parfait, merci</button>
            </form>
          </div>
        )}
      </dialog>
    </div>
  );
}
