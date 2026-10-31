/** Données de la carte et du restaurant, lues dans Supabase (voir supabase/migrations). */

export type Spice = "doux" | "moyen" | "fort";
export const spiceLabel: Record<Spice, string> = { doux: "Doux", moyen: "Moyen", fort: "Fort" };

export type Model3D = {
  /** Fichier GLB (Android, ordinateur). L'USDZ pour iPhone est généré automatiquement si absent. */
  glb: string;
  usdz?: string;
  /** Ce que représente réellement le modèle, affiché à l'utilisateur. */
  label: string;
  /** true = aperçu provisoire, pas le plat du restaurant */
  isDemo: boolean;
  sizeKb: number;
  arEnabled: boolean;
};

export type Category = { id: string; label: string };

export type Dish = {
  slug: string;
  name: string;
  description: string;
  /** Prix en FCFA (null = non communiqué, le plat ne peut pas être commandé) */
  price: number | null;
  category: string;
  /** Petite étiquette affichée sur la carte (ex. « Signature ») */
  badge: string | null;
  tags: string[];
  spice: Spice;
  available: boolean;
  /** Plus grand = plus populaire */
  popularity: number;
  prepMinutes: number | null;
  photo: string | null;
  /** true = photo d'illustration, pas une photo du restaurant */
  photoIsIllustration: boolean;
  model: Model3D | null;
  /** Accompagnements et boissons à proposer quand on ajoute ce plat (ordre de préférence). */
  pairsWith: string[];
};

/** Plage d'arrivée d'un service (heures « HH:MM »). */
export type Service = { id: string; label: string; start: string; end: string };
export type Zone = { id: string; label: string; detail: string };

/** Champs pouvant être marqués provisoires dans restaurant_settings.provisional */
export type ProvisionalField = "address" | "phone" | "email" | "hours" | "social" | "services" | "zones" | "policy" | "prices" | "images";

export type Settings = {
  name: string;
  tagline: string;
  area: string;
  description: string;
  address: string;
  phone: string;
  /** International, sans « + » ni espace ; vide = pas de WhatsApp */
  whatsapp: string;
  email: string;
  hours: { days: string; time: string }[];
  social: Record<string, string>;
  images: { hero: string; partage: string };
  policy: string;
  groupFrom: number;
  daysAhead: number;
  /** 0 = dimanche … 6 = samedi */
  closedWeekdays: number[];
  zones: Zone[];
  services: Service[];
  provisional: ProvisionalField[];
  /** false = site en préparation (non indexé) */
  launched: boolean;
};

export type Catalogue = { categories: Category[]; dishes: Dish[]; settings: Settings };

export const isProvisional = (s: Settings, field: ProvisionalField) => s.provisional.includes(field);
export const categoryLabel = (categories: Category[], id: string) => categories.find((c) => c.id === id)?.label ?? id;
