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

/**
 * Semaines complètes (lundi → dimanche) couvrant aujourd'hui et les `daysAhead` jours suivants.
 */
export function buildCalendar(today: Date, daysAhead: number, closedWeekdays: number[]): CalendarDay[][] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last = new Date(start);
  last.setDate(start.getDate() + daysAhead);

  const cursor = new Date(start);
  cursor.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // lundi de la semaine en cours
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - ((last.getDay() + 6) % 7))); // dimanche de la dernière semaine

  const weeks: CalendarDay[][] = [];
  while (cursor <= end) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(cursor);
      week.push({
        iso: toIso(d),
        day: d.getDate(),
        bookable: d >= start && d <= last && !closedWeekdays.includes(d.getDay()),
        isToday: toIso(d) === toIso(start),
        monthLabel: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
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
  guests: z.number().int().min(1, "Choisissez le nombre de convives").max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choisissez un créneau"),
  zone: z.string().optional(),
  name: z.string().trim().min(2, "Indiquez votre nom").max(80),
  phone: phoneCI,
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]).optional(),
  comment: z.string().trim().max(500, "500 caractères maximum").optional(),
});

export type ReservationInput = z.input<typeof reservationSchema>;
