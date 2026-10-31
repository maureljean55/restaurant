"use server";

import { reservation as config } from "@/config/site";
import { dbErrorCode, dbErrorMessages } from "@/lib/domain/order";
import { reservationSchema, type ReservationInput } from "@/lib/domain/reservation";
import { supabaseAdmin } from "@/lib/supabase/server";

export type ReservationResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fields?: Partial<Record<keyof ReservationInput, string>> };

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
  if (r.guests > config.maxGuestsOnline) return { ok: false, error: dbErrorMessages.GUESTS_OUT_OF_RANGE };

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
    return { ok: false, error: code ? dbErrorMessages[code] : "La demande n'a pas pu être envoyée. Réessayez dans un instant." };
  }
  return { ok: true, reference: data.reference };
}
