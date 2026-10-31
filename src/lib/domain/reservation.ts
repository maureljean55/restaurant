/**
 * Règles de réservation — logique pure, partagée entre le formulaire et (bientôt) le serveur.
 * La disponibilité réelle (capacité, tables restantes) sera vérifiée côté serveur avec Supabase.
 */
import { z } from "zod";

export type CalendarDay = {
  /** AAAA-MM-JJ, heure locale */
  iso: string;
  day: number;
  /** false = passé, fermé ou hors période réservable */
  bookable: boolean;
  isToday: boolean;
  monthLabel: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export type MonthDay = CalendarDay & { inMonth: boolean };

/**
 * Grille d'un mois (semaines complètes du lundi au dimanche).
 * Réservable : d'aujourd'hui à aujourd'hui + `daysAhead`, hors jours fermés.
 */
export function buildMonth(year: number, month: number, today: Date, daysAhead: number, closedWeekdays: number[]): MonthDay[][] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last = new Date(start);
  last.setDate(start.getDate() + daysAhead);

  const first = new Date(year, month, 1);
  const cursor = new Date(first);
  cursor.setDate(1 - ((first.getDay() + 6) % 7)); // lundi de la première semaine
  const lastOfMonth = new Date(year, month + 1, 0);
  const end = new Date(lastOfMonth);
  end.setDate(lastOfMonth.getDate() + (6 - ((lastOfMonth.getDay() + 6) % 7))); // dimanche de la dernière semaine

  const weeks: MonthDay[][] = [];
  while (cursor <= end) {
    const week: MonthDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(cursor);
      const inMonth = d.getMonth() === month;
      week.push({
        iso: toIso(d),
        day: d.getDate(),
        inMonth,
        bookable: inMonth && d >= start && d <= last && !closedWeekdays.includes(d.getDay()),
        isToday: toIso(d) === toIso(start),
        monthLabel: first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

type Window = { id: string; start: string; end: string };

/** Service dont la plage contient l'heure donnée (bornes incluses). */
export function serviceAt<S extends Window>(time: string, services: readonly S[]): S | undefined {
  return services.find((s) => time >= s.start && time <= s.end);
}

/** Heures proposées en raccourci dans une plage (toutes les `step` minutes). */
export function timeSuggestions(start: string, end: string, step = 30): string[] {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const out: string[] = [];
  for (let m = Math.ceil(toMin(start) / step) * step; m <= toMin(end); m += step) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
}

/** Créneaux encore possibles pour une date donnée (on retire ceux déjà passés aujourd'hui, avec une marge). */
export function slotIsPast(dateIso: string, slot: string, now: Date, marginMinutes = 60): boolean {
  if (dateIso !== toIso(now)) return false;
  const [h, m] = slot.split(":").map(Number);
  const slotTime = new Date(now);
  slotTime.setHours(h, m, 0, 0);
  return slotTime.getTime() - now.getTime() < marginMinutes * 60_000;
}

/** Téléphone ivoirien : 10 chiffres (ex. 07 00 12 34 56), espaces tolérés. */
export const phoneCI = z
  .string()
  .transform((s) => s.replace(/[\s.-]/g, "").replace(/^(\+225|00225)/, ""))
  .pipe(z.string().regex(/^0\d{9}$/, "Numéro à 10 chiffres, ex. 07 00 12 34 56"));

export const reservationSchema = z.object({
  guests: z
    .number("Indiquez le nombre de convives")
    .int("Indiquez un nombre entier")
    .min(1, "Au moins 1 personne")
    .max(100, "100 personnes maximum en ligne : contactez le restaurant pour un événement"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choisissez une heure d'arrivée"),
  zone: z.string().optional(),
  name: z.string().trim().min(2, "Indiquez votre nom").max(80),
  phone: phoneCI,
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]).optional(),
  comment: z.string().trim().max(500, "500 caractères maximum").optional(),
});

export type ReservationInput = z.input<typeof reservationSchema>;
