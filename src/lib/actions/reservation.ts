"use server";

import { dbErrorCode, dbErrorMessages } from "@/lib/domain/order";
import { reservationSchema, type ReservationInput } from "@/lib/domain/reservation";
import { supabaseAdmin } from "@/lib/supabase/server";

export type ReservationResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fields?: Partial<Record<keyof ReservationInput, string>> };

export type ServiceAvailability = { id: string; label: string; start: string; end: string; remaining: number };

const placesRestantes = (n: number) =>
  n === 0
    ? "Ce service est complet ce jour-là. Choisissez une autre heure ou une autre date."
    : `Il ne reste que ${n} place${n > 1 ? "s" : ""} pour ce service. Réduisez le nombre de convives ou choisissez un autre moment.`;

/** Enregistre une DEMANDE de réservation (statut « en attente ») : le restaurant confirme ensuite. */
export async function createReservation(input: ReservationInput): Promise<ReservationResult> {
  // Les données viennent du navigateur : on revalide tout ici.
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Partial<Record<keyof ReservationInput, string>> = {};
    for (const issue of parsed.error.issues) fields[issue.path[0] as keyof ReservationInput] ??= issue.message;
    return { ok: false, error: "Certains champs sont à corriger.", fields };
  }
  const r = parsed.data;

  const db = supabaseAdmin();
  if (!db) return { ok: false, error: "Les réservations en ligne ne sont pas encore ouvertes. Merci de contacter le restaurant." };

  const { data, error } = await db
    .rpc("create_reservation", {
      p_date: r.date,
      p_time: r.time,
      p_guests: r.guests,
      p_zone: r.zone ?? "",
      p_name: r.name,
      p_phone: r.phone,
      p_email: r.email ?? "",
      p_comment: r.comment ?? "",
    })
    .single<{ id: string; reference: string }>();

  if (error || !data) {
    const code = dbErrorCode(error?.message);
    if (!code) console.error("create_reservation", error);
    if (code === "SLOT_FULL") {
      const message = placesRestantes(Number(error?.details) || 0);
      return { ok: false, error: message, fields: { guests: message } };
    }
    const champ = code?.startsWith("GUESTS") ? "guests" : code?.startsWith("DATE") ? "date" : code?.startsWith("SLOT") ? "time" : undefined;
    return {
      ok: false,
      error: code ? dbErrorMessages[code] : "La demande n'a pas pu être envoyée. Réessayez dans un instant.",
      fields: champ && code ? { [champ]: dbErrorMessages[code] } : undefined,
    };
  }
  return { ok: true, reference: data.reference };
}

/** Places restantes par service pour une date (null si la base n'est pas connectée ou en cas d'erreur). */
export async function getAvailability(date: string): Promise<ServiceAvailability[] | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.rpc("reservation_availability", { p_date: date });
  if (error) {
    console.error("reservation_availability", error);
    return null;
  }
  return (data as { service_id: string; label: string; starts: string; ends: string; remaining: number }[]).map((s) => ({
    id: s.service_id,
    label: s.label,
    start: s.starts.slice(0, 5),
    end: s.ends.slice(0, 5),
    remaining: s.remaining,
  }));
}
