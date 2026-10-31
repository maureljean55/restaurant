"use server";

import { dbErrorCode, dbErrorMessages, orderSchema, type OrderInput } from "@/lib/domain/order";
import { supabaseAdmin } from "@/lib/supabase/server";

export type OrderResult =
  | { ok: true; token: string; number: number }
  | { ok: false; error: string; fields?: Partial<Record<"mode" | "name" | "phone" | "address" | "note", string>> };

/** Crée la commande. Les prix et le total sont recalculés par la base à partir de la carte. */
export async function createOrder(input: OrderInput): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fields: NonNullable<Extract<OrderResult, { ok: false }>["fields"]> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (k === "mode" || k === "name" || k === "phone" || k === "address" || k === "note") fields[k] ??= issue.message;
    }
    return { ok: false, error: Object.keys(fields).length ? "Certains champs sont à corriger." : "Votre panier n'est pas valide.", fields };
  }
  const o = parsed.data;

  const db = supabaseAdmin();
  if (!db) return { ok: false, error: "Les commandes en ligne ne sont pas encore ouvertes. Merci de contacter le restaurant." };

  const { data, error } = await db
    .rpc("create_order", {
      p_mode: o.mode,
      p_name: o.name,
      p_phone: o.phone,
      p_address: o.mode === "delivery" ? (o.address ?? "") : null,
      p_note: o.note ?? "",
      p_items: o.items.map(({ slug, qty }) => ({ slug, qty })),
    })
    .single<{ id: string; token: string; number: number; subtotal: number }>();

  if (error || !data) {
    const code = dbErrorCode(error?.message);
    if (!code) console.error("create_order", error);
    return { ok: false, error: code ? dbErrorMessages[code] : "La commande n'a pas pu être envoyée. Réessayez dans un instant." };
  }
  return { ok: true, token: data.token, number: data.number };
}
