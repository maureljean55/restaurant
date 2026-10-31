import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type OrderStatus = "received" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled";

export type TrackedOrder = {
  number: number;
  mode: "pickup" | "delivery";
  status: OrderStatus;
  name: string;
  address: string | null;
  subtotal: number;
  delivery_fee: number | null;
  payment_status: "unpaid" | "paid";
  created_at: string;
  order_items: { name: string; unit_price: number; qty: number; line_total: number }[];
};

/** Commande retrouvée par son lien de suivi (jeton secret). Champs limités à ce que le client doit voir. */
export async function getOrderByToken(token: string): Promise<TrackedOrder | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .select("number, mode, status, name, address, subtotal, delivery_fee, payment_status, created_at, order_items (name, unit_price, qty, line_total)")
    .eq("token", token)
    .maybeSingle<TrackedOrder>();
  if (error) console.error("getOrderByToken", error);
  return data ?? null;
}
