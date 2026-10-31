/**
 * Informations du restaurant.
 *
 * ⚠️ Toutes les valeurs marquées `placeholder: true` sont PROVISOIRES.
 * Remplacez-les ici : c'est le seul endroit à modifier.
 * (Elles seront ensuite gérées depuis l'administration via Supabase.)
 */

export const site = {
  name: { value: "LE-TCHE", placeholder: false },
  /** Logo : médaillon noir et or (fonds clairs) et emblème or détouré (fonds sombres). Voir scripts/preparer-logo.mjs. */
  logo: { medaillon: "/brand/le-tche-medaillon.png", or: "/brand/le-tche-or.png" },
  /** false tant que le site n'est pas officiellement ouvert : pas d'indexation par les moteurs de recherche. */
  launched: false,
  tagline: { value: "Cuisine ivoirienne · Abidjan", placeholder: false },
  /** Quartier affiché sous le nom dans l'en-tête. */
  area: { value: "Abidjan", placeholder: true },
  description: {
    value:
      "Restaurant de cuisine ivoirienne à Abidjan. Commande en ligne, réservation de table et plats à découvrir en 3D.",
    placeholder: false,
  },
  address: { value: "Adresse à venir, Abidjan", placeholder: true },
  phone: { value: "+225 00 00 00 00 00", placeholder: true },
  /** Numéro WhatsApp au format international, sans espace ni « + ». */
  whatsapp: { value: "", placeholder: true },
  email: { value: "contact@exemple.ci", placeholder: true },
  hours: {
    value: [
      { days: "Lundi – Vendredi", time: "À définir" },
      { days: "Samedi – Dimanche", time: "À définir" },
    ],
    placeholder: true,
  },
  social: {
    value: { facebook: "", instagram: "", tiktok: "" },
    placeholder: true,
  },
} as const;

/** Règles de réservation (provisoires, à valider avec le restaurant). Alignées sur la base (supabase/migrations). */
export const reservation = {
  placeholder: true,
  /** Nombre de convives saisi librement. */
  minGuests: 1,
  maxGuests: 100,
  /** À partir de ce nombre, on prévient que le restaurant rappellera pour organiser. */
  groupFrom: 12,
  /** Nombre de jours réservables à l'avance. */
  daysAhead: 365,
  /** Jours fermés (0 = dimanche … 6 = samedi). */
  closedWeekdays: [] as number[],
  /** Plages d'arrivée possibles. La capacité de chaque service est gérée dans la base. */
  services: [
    { id: "dejeuner", label: "Déjeuner", start: "11:30", end: "15:00" },
    { id: "diner", label: "Dîner", start: "18:30", end: "22:30" },
  ],
  /** Zones proposées. Laisser vide si le restaurant n'en a qu'une. */
  zones: [
    { id: "indifferent", label: "Sans préférence", detail: "Nous vous plaçons au mieux" },
    { id: "interieur", label: "Salle intérieure", detail: "À confirmer" },
    { id: "terrasse", label: "Terrasse", detail: "À confirmer" },
  ],
  policy: "Conditions d'annulation et de retard à définir par le restaurant.",
};

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Carte" },
  { href: "/experience-3d", label: "Expérience 3D" },
  { href: "/reservation", label: "Réserver" },
] as const;

export function whatsappUrl(message = "Bonjour, je souhaite passer commande.") {
  if (!site.whatsapp.value) return null;
  return `https://wa.me/${site.whatsapp.value}?text=${encodeURIComponent(message)}`;
}
