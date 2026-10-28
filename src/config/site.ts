/**
 * Informations du restaurant.
 *
 * ⚠️ Toutes les valeurs marquées `placeholder: true` sont PROVISOIRES.
 * Remplacez-les ici : c'est le seul endroit à modifier.
 * (Elles seront ensuite gérées depuis l'administration via Supabase.)
 */

export type Placeholder<T> = { value: T; placeholder: boolean };

export const site = {
  name: { value: "Nom du restaurant", placeholder: true },
  tagline: {
    value: "Cuisine ivoirienne · Abidjan",
    placeholder: false,
  },
  description: {
    value:
      "Restaurant de cuisine ivoirienne traditionnelle à Abidjan. Commande en ligne, réservation de table et plats à découvrir en 3D.",
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

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/reservation", label: "Réserver" },
  { href: "/contact", label: "Contact" },
] as const;

export function whatsappUrl(message = "Bonjour, je souhaite passer commande.") {
  if (!site.whatsapp.value) return null;
  return `https://wa.me/${site.whatsapp.value}?text=${encodeURIComponent(message)}`;
}
