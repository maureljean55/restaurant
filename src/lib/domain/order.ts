/**
 * Validation d'une commande — partagée entre le formulaire et le serveur.
 * Les prix ne font PAS partie de la commande envoyée : la base les recalcule.
 */
import { z } from "zod";
import { MAX_QTY_PER_LINE } from "./pricing";
import { phoneCI } from "./reservation";

export const orderSchema = z
  .object({
    mode: z.enum(["pickup", "delivery"], "Choisissez retrait ou livraison"),
    name: z.string().trim().min(2, "Indiquez votre nom").max(80),
    phone: phoneCI,
    address: z.string().trim().max(300, "300 caractères maximum").optional(),
    note: z.string().trim().max(500, "500 caractères maximum").optional(),
    items: z
      .array(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), qty: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
      .min(1, "Votre panier est vide")
      .max(30),
  })
  .refine((o) => o.mode === "pickup" || (o.address ?? "").length >= 5, {
    path: ["address"],
    message: "Indiquez l'adresse de livraison (quartier, rue, repère)",
  });

export type OrderInput = z.input<typeof orderSchema>;

/** Messages affichés pour les erreurs renvoyées par la base (create_order / create_reservation). */
export const dbErrorMessages: Record<string, string> = {
  EMPTY_ORDER: "Votre panier est vide.",
  TOO_MANY_LINES: "Votre commande contient trop d'articles différents.",
  BAD_QTY: "Une quantité n'est pas valide (20 maximum par plat).",
  UNKNOWN_DISH: "Un plat de votre panier n'est plus à la carte. Retirez-le puis réessayez.",
  DISH_UNAVAILABLE: "Un plat de votre panier n'est plus disponible aujourd'hui. Retirez-le puis réessayez.",
  ADDRESS_REQUIRED: "Indiquez l'adresse de livraison.",
  GUESTS_OUT_OF_RANGE: "Pour plus de 8 personnes, contactez directement le restaurant.",
  DATE_OUT_OF_RANGE: "Cette date n'est pas réservable en ligne. Choisissez-en une autre.",
  SLOT_UNKNOWN: "Ce créneau n'existe pas. Choisissez-en un autre.",
  SLOT_PAST: "Ce créneau est trop proche ou déjà passé. Choisissez-en un autre.",
  SLOT_FULL: "Ce service est complet. Choisissez un autre créneau ou une autre date.",
};

/** Code d'erreur métier contenu dans un message Postgres, s'il y en a un. */
export function dbErrorCode(message: string | undefined): string | null {
  const code = message?.match(/\b[A-Z][A-Z_]{3,}\b/)?.[0];
  return code && code in dbErrorMessages ? code : null;
}
