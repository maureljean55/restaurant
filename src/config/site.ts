/**
 * Éléments fixes du site.
 * Les informations du restaurant (nom, adresse, téléphone, horaires, zones, règles de réservation)
 * et la carte sont dans Supabase : tables restaurant_settings, reservation_services, categories, dishes.
 */

/** Logo : médaillon noir et or (fonds clairs) et emblème or détouré (fonds sombres). Voir scripts/preparer-logo.mjs. */
export const brand = {
  logo: { medaillon: "/brand/le-tche-medaillon.png", or: "/brand/le-tche-or.png" },
} as const;

/** Limites du nombre de convives en ligne (identiques à la base : create_reservation). */
export const reservationLimits = { minGuests: 1, maxGuests: 100 } as const;

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Carte" },
  { href: "/experience-3d", label: "Expérience 3D" },
  { href: "/reservation", label: "Réserver" },
] as const;

export function whatsappUrl(number: string, message = "Bonjour, je souhaite passer commande.") {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
