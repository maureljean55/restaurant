"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { CATALOGUE_TAG } from "@/lib/catalogue/server";
import { canChangeOrder, canChangeReservation, type OrderMode, type OrderStatus, type ReservationStatus } from "@/lib/domain/workflow";
import { getStaff, supabaseSession } from "@/lib/supabase/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NON_CONNECTE: ActionResult = { ok: false, error: "Session expirée : reconnectez-vous." };
const REFUSE: ActionResult = { ok: false, error: "Action non autorisée pour votre compte." };
const ECHEC: ActionResult = { ok: false, error: "L'enregistrement a échoué. Réessayez." };

const uuid = z.uuid();

async function session(adminOnly = false) {
  const membre = await getStaff();
  if (!membre) return null;
  if (adminOnly && membre.role !== "admin") return "refus" as const;
  return supabaseSession();
}

/** Fait avancer une commande d'une étape (contrôle de l'enchaînement côté serveur). */
export async function changeOrderStatus(id: string, to: OrderStatus): Promise<ActionResult> {
  if (!uuid.safeParse(id).success) return ECHEC;
  const db = await session();
  if (!db || db === "refus") return NON_CONNECTE;
  const { data: o } = await db.from("orders").select("status, mode").eq("id", id).single<{ status: OrderStatus; mode: OrderMode }>();
  if (!o) return ECHEC;
  if (!canChangeOrder(o.status, to, o.mode)) return { ok: false, error: "Cette étape n'est plus possible : la commande a peut-être déjà été traitée." };
  // Le filtre sur l'ancien statut évite qu'un double clic ou deux postes fassent sauter une étape
  const { data, error } = await db.from("orders").update({ status: to }).eq("id", id).eq("status", o.status).select("id");
  if (error || !data?.length) return error ? ECHEC : { ok: false, error: "Commande déjà mise à jour par un autre poste." };
  refresh();
  return { ok: true };
}

export async function setOrderPaid(id: string, paid: boolean): Promise<ActionResult> {
  if (!uuid.safeParse(id).success) return ECHEC;
  const db = await session();
  if (!db || db === "refus") return NON_CONNECTE;
  const { error } = await db.from("orders").update({ payment_status: paid ? "paid" : "unpaid" }).eq("id", id);
  if (error) return ECHEC;
  refresh();
  return { ok: true };
}

export async function setDeliveryDetails(id: string, input: { fee?: number | null; courier?: string }): Promise<ActionResult> {
  const parsed = z
    .object({ fee: z.number().int().min(0).max(100_000).nullable().optional(), courier: z.string().trim().max(80).optional() })
    .safeParse(input);
  if (!uuid.safeParse(id).success || !parsed.success) return { ok: false, error: "Valeur invalide (frais entre 0 et 100 000 FCFA)." };
  const db = await session();
  if (!db || db === "refus") return NON_CONNECTE;
  const patch: Record<string, unknown> = {};
  if (parsed.data.fee !== undefined) patch.delivery_fee = parsed.data.fee;
  if (parsed.data.courier !== undefined) patch.courier_name = parsed.data.courier || null;
  const { error } = await db.from("orders").update(patch).eq("id", id);
  if (error) return ECHEC;
  refresh();
  return { ok: true };
}

export async function changeReservationStatus(id: string, to: ReservationStatus): Promise<ActionResult> {
  if (!uuid.safeParse(id).success) return ECHEC;
  const db = await session();
  if (!db || db === "refus") return NON_CONNECTE;
  const { data: r } = await db.from("reservations").select("status").eq("id", id).single<{ status: ReservationStatus }>();
  if (!r) return ECHEC;
  if (!canChangeReservation(r.status, to)) return { ok: false, error: "Cette réservation a déjà été traitée." };
  const { data, error } = await db.from("reservations").update({ status: to }).eq("id", id).eq("status", r.status).select("id");
  if (error || !data?.length) return ECHEC;
  refresh();
  return { ok: true };
}

const dishPatch = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(80).optional(),
  description: z.string().trim().max(400, "400 caractères maximum").optional(),
  price: z.number().int().min(0).max(1_000_000).nullable().optional(),
  badge: z.string().trim().max(30).nullable().optional(),
  available: z.boolean().optional(),
});

/** Modifie un plat (administrateurs) ; le site public est mis à jour immédiatement. */
export async function updateDish(slug: string, input: z.input<typeof dishPatch>): Promise<ActionResult> {
  const parsed = dishPatch.safeParse(input);
  if (!/^[a-z0-9-]+$/.test(slug) || !parsed.success) return { ok: false, error: parsed.error?.issues[0]?.message ?? "Valeur invalide." };
  const db = await session(true);
  if (!db) return NON_CONNECTE;
  if (db === "refus") return REFUSE;
  const patch = { ...parsed.data, ...(parsed.data.badge !== undefined ? { badge: parsed.data.badge || null } : {}) };
  const { data, error } = await db.from("dishes").update(patch).eq("slug", slug).select("slug");
  if (error || !data?.length) return error ? ECHEC : REFUSE;
  updateTag(CATALOGUE_TAG);
  refresh();
  return { ok: true };
}
