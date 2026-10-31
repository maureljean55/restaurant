"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { createReservation, getAvailability, type ServiceAvailability } from "@/lib/actions/reservation";
import { reservation, site } from "@/config/site";
import { demoAmbiance } from "@/data/demo-dishes";
import { buildMonth, reservationSchema, serviceAt, slotIsPast, timeSuggestions, type ReservationInput } from "@/lib/domain/reservation";
import { btn, pastille } from "@/components/ui/styles";
import { IconCalendar, IconCheck, IconChevron, IconClock, IconInfo, IconMinus, IconMoon, IconPhone, IconPin, IconPlus, IconShield, IconSun, IconUsers } from "@/components/ui/icons";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const RACCOURCIS_CONVIVES = [2, 4, 6, 8, 10, 15, 20];
const heure = (t: string) => t.replace(":", "h");

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
        <p role="alert" className="mt-2 text-body-sm text-erreur">
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
  // Texte libre (le champ peut être vide pendant la saisie) ; nombre déduit ci-dessous
  const [convivesTexte, setConvivesTexte] = useState("2");
  const [mois, setMois] = useState<{ y: number; m: number } | null>(null);
  const [dispo, setDispo] = useState<ServiceAvailability[] | null>(null);
  const [chargement, setChargement] = useState(false);
  const derniereDate = useRef("");
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
    const d = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaintenant(d);
    setMois({ y: d.getFullYear(), m: d.getMonth() });
  }, []);

  const guests = /^\d+$/.test(convivesTexte) ? Number(convivesTexte) : Number.NaN;
  const nb = Number.isFinite(guests) ? guests : 0;
  const changerConvives = (n: number) => setConvivesTexte(String(Math.min(reservation.maxGuests, Math.max(reservation.minGuests, n))));

  const semaines = useMemo(
    () => (maintenant && mois ? buildMonth(mois.y, mois.m, maintenant, reservation.daysAhead, reservation.closedWeekdays) : []),
    [maintenant, mois],
  );
  const moisAffiche = semaines[1]?.[0]?.monthLabel ?? "";
  const limite = maintenant ? new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + reservation.daysAhead) : null;
  const peutReculer = !!(maintenant && mois && (mois.y > maintenant.getFullYear() || mois.m > maintenant.getMonth()));
  const peutAvancer = !!(limite && mois && (mois.y < limite.getFullYear() || mois.m < limite.getMonth()));
  const decaler = (n: number) => setMois((x) => (x ? { y: x.y + Math.floor((x.m + n) / 12), m: (((x.m + n) % 12) + 12) % 12 } : x));

  // Places restantes pour la date choisie (la base fait foi ; les plages de la config servent d'affichage par défaut)
  function choisirDate(iso: string) {
    setDate(iso);
    setTime("");
    setDispo(null);
    setChargement(true);
    derniereDate.current = iso;
    getAvailability(iso)
      .catch(() => null)
      .then((d) => {
        if (derniereDate.current !== iso) return; // une autre date a été choisie entre-temps
        setDispo(d);
        setChargement(false);
      });
  }
  const services = reservation.services.map((s) => {
    const d = dispo?.find((x) => x.id === s.id);
    return { ...s, start: d?.start ?? s.start, end: d?.end ?? s.end, remaining: d?.remaining };
  });
  const serviceChoisi = time ? serviceAt(time, services) : undefined;
  const avertissementHeure = !time
    ? null
    : !serviceChoisi
      ? "Cette heure est en dehors des services."
      : date && maintenant && slotIsPast(date, time, maintenant)
        ? "Cette heure est passée ou trop proche (1 h minimum à l'avance)."
        : serviceChoisi.remaining !== undefined && nb > serviceChoisi.remaining
          ? serviceChoisi.remaining === 0
            ? `Le ${serviceChoisi.label.toLowerCase()} est complet ce jour-là.`
            : `Il ne reste que ${serviceChoisi.remaining} place${serviceChoisi.remaining > 1 ? "s" : ""} au ${serviceChoisi.label.toLowerCase()}.`
          : null;

  const personnes = nb ? `${nb} personne${nb > 1 ? "s" : ""}` : "Nombre de convives à préciser";
  const resume = date
    ? `${personnes} · ${new Date(`${date}T12:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}${time ? ` à ${heure(time)}` : ""}`
    : personnes;

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
        const champs = r.fields ?? {};
        setErreurs(champs);
        const premier = Object.keys(champs)[0];
        // Le détail est affiché dans l'étape concernée : en bas, un simple renvoi
        setErreurEnvoi(premier ? "Votre demande n'est pas partie : voir le point signalé plus haut." : r.error);
        if (premier) document.getElementById(`etape-${premier}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            <Etape n={1} titre="Nombre de convives" icone={<IconUsers width={18} height={18} />} erreur={erreurs.guests}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => changerConvives(nb - 1)}
                  disabled={nb <= reservation.minGuests}
                  aria-label="Une personne de moins"
                  className="verre-survol grid size-12 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-or disabled:opacity-35"
                >
                  <IconMinus width={18} height={18} />
                </button>
                <label className="flex min-w-0 flex-1 flex-col items-center">
                  <span className="sr-only">Nombre de convives (1 à {reservation.maxGuests})</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={reservation.minGuests}
                    max={reservation.maxGuests}
                    step={1}
                    value={convivesTexte}
                    onChange={(e) => setConvivesTexte(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    onBlur={() => convivesTexte && changerConvives(nb)}
                    aria-invalid={!!erreurs.guests}
                    className="prix h-14 w-full max-w-36 rounded-xl border border-ligne bg-surface text-center font-display text-headline-md text-or outline-none [appearance:textfield] focus:border-or focus:ring-1 focus:ring-or [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="mt-1 text-label-sm text-texte/60">personne{nb > 1 ? "s" : ""}</span>
                </label>
                <button
                  type="button"
                  onClick={() => changerConvives(nb + 1)}
                  disabled={nb >= reservation.maxGuests}
                  aria-label="Une personne de plus"
                  className="verre-survol grid size-12 shrink-0 place-items-center rounded-full border border-ligne bg-surface text-or disabled:opacity-35"
                >
                  <IconPlus width={18} height={18} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Raccourcis">
                {RACCOURCIS_CONVIVES.map((n) => (
                  <button key={n} type="button" onClick={() => setConvivesTexte(String(n))} aria-pressed={nb === n} className={`${choix(nb === n)} h-9 min-w-11 px-3`}>
                    {n}
                  </button>
                ))}
              </div>
              {nb >= reservation.groupFrom && (
                <p className="mt-3 flex items-start gap-1.5 text-[12px] text-texte/70">
                  <IconInfo width={14} height={14} className="mt-0.5 shrink-0 text-champagne" />
                  Groupe de {nb} : le restaurant vous rappellera pour organiser l&apos;accueil (placement, menu).
                </p>
              )}
            </Etape>
          </div>

          {/* 2. Date */}
          <div id="etape-date">
            <Etape
              n={2}
              titre="Date"
              icone={<IconCalendar width={18} height={18} />}
              aside={
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => decaler(-1)} disabled={!peutReculer} aria-label="Mois précédent" className="verre-survol grid size-9 place-items-center rounded-full text-or disabled:opacity-30">
                    <IconChevron width={16} height={16} className="rotate-180" />
                  </button>
                  <span className="min-w-28 text-center text-label-md text-champagne capitalize" aria-live="polite">{moisAffiche}</span>
                  <button type="button" onClick={() => decaler(1)} disabled={!peutAvancer} aria-label="Mois suivant" className="verre-survol grid size-9 place-items-center rounded-full text-or disabled:opacity-30">
                    <IconChevron width={16} height={16} />
                  </button>
                </div>
              }
              erreur={erreurs.date}
            >
              <div className="grid grid-cols-7 gap-1 text-center">
                {JOURS.map((j) => (
                  <span key={j} className="pb-1 text-[10px] font-semibold text-texte/55 uppercase">
                    {j}
                  </span>
                ))}
                {maintenant
                  ? semaines.flat().map((d) =>
                      d.inMonth ? (
                        <button
                          key={d.iso}
                          type="button"
                          disabled={!d.bookable}
                          onClick={() => choisirDate(d.iso)}
                          aria-pressed={date === d.iso}
                          aria-label={new Date(`${d.iso}T12:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          className={`${choix(date === d.iso, !d.bookable)} relative h-10 sm:h-11`}
                        >
                          {d.day}
                          {d.isToday && <span className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${date === d.iso ? "bg-noir" : "bg-or"}`} />}
                        </button>
                      ) : (
                        <span key={d.iso} aria-hidden className="h-10 sm:h-11" />
                      ),
                    )
                  : Array.from({ length: 35 }, (_, i) => <span key={i} className="h-10 animate-pulse rounded-lg bg-surface-haute sm:h-11" />)}
              </div>
              <p className="mt-3 text-[12px] text-texte/60">Réservable jusqu&apos;à un an à l&apos;avance. Le point indique aujourd&apos;hui.</p>
            </Etape>
          </div>

          {/* 3. Heure d'arrivée */}
          <div id="etape-time">
            <Etape n={3} titre="Heure d'arrivée" icone={<IconClock width={18} height={18} />} erreur={erreurs.time}>
              {!date ? (
                <p className="text-body-sm text-texte/60">Choisissez d&apos;abord une date.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {services.map((s) => {
                    const complet = s.remaining !== undefined && s.remaining < Math.max(nb, 1);
                    return (
                      <div key={s.id}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-label-md text-texte">
                            {s.id === "diner" ? <IconMoon width={16} height={16} className="text-champagne" /> : <IconSun width={16} height={16} className="text-champagne" />}
                            {s.label}
                            <span className="font-normal text-texte/55">
                              · {heure(s.start)} – {heure(s.end)}
                            </span>
                          </p>
                          <span className={`text-label-sm ${s.remaining === undefined ? "text-texte/45" : complet ? "text-erreur" : "text-champagne"}`}>
                            {chargement
                              ? "…"
                              : s.remaining === undefined
                                ? ""
                                : s.remaining === 0
                                  ? "Complet"
                                  : `${s.remaining} place${s.remaining > 1 ? "s" : ""} restante${s.remaining > 1 ? "s" : ""}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                          {timeSuggestions(s.start, s.end).map((t) => {
                            const indispo = complet || (maintenant ? slotIsPast(date, t, maintenant) : true);
                            return (
                              <button key={t} type="button" disabled={indispo} aria-pressed={time === t} onClick={() => setTime(t)} className={`${choix(time === t, indispo)} h-10`}>
                                {heure(t)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <label className="flex flex-wrap items-center gap-3 border-t border-ligne pt-4">
                    <span className="text-label-md text-texte">Ou une autre heure :</span>
                    <input
                      type="time"
                      step={300}
                      value={time}
                      onChange={(e) => setTime(e.target.value.slice(0, 5))}
                      aria-invalid={!!avertissementHeure}
                      className="h-11 rounded-lg border border-ligne bg-surface px-3 text-body-md text-texte outline-none [color-scheme:dark] focus:border-or focus:ring-1 focus:ring-or"
                    />
                  </label>
                  {avertissementHeure && (
                    <p className="flex items-start gap-1.5 text-body-sm text-erreur">
                      <IconInfo width={16} height={16} className="mt-0.5 shrink-0" />
                      {avertissementHeure}
                    </p>
                  )}
                </div>
              )}
              {reservation.placeholder && <p className="mt-3 text-[12px] text-texte/55">Heures de service provisoires, à confirmer par le restaurant.</p>}
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
