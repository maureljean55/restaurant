/**
 * DONNÉES DE DÉMONSTRATION — à remplacer par le menu réel.
 *
 * - Les noms sont des classiques de la cuisine ivoirienne : ce n'est PAS la carte du restaurant.
 * - Les PRIX sont des EXEMPLES pour tester le panier ; ils seront fournis par le restaurant.
 * - Les PHOTOS sont des photos d'illustration (Unsplash), pas des plats du restaurant.
 * - Les MODÈLES 3D sont des objets de démonstration (Poly Haven, CC0), pas les plats eux-mêmes.
 * Sources : docs/visuels-provisoires.md
 * Ce fichier disparaîtra quand les plats viendront de Supabase.
 */

export type Spice = "doux" | "moyen" | "fort";

export type Model3D = {
  /** Fichier GLB (Android, ordinateur). L'USDZ pour iPhone est généré automatiquement si absent. */
  glb: string;
  usdz?: string;
  /** Ce que représente réellement le modèle, affiché à l'utilisateur. */
  label: string;
  /** true = objet de démonstration, pas le plat du restaurant */
  isDemo: boolean;
  sizeKb: number;
  arEnabled: boolean;
};

export type Category = { id: string; label: string };

export const categories: Category[] = [
  { id: "plats", label: "Plats traditionnels" },
  { id: "grillades", label: "Grillades & poissons" },
  { id: "accompagnements", label: "Accompagnements" },
  { id: "boissons", label: "Boissons" },
];

export type DemoDish = {
  slug: string;
  name: string;
  description: string;
  /** Prix d'EXEMPLE en FCFA (null = non communiqué) */
  price: number | null;
  category: string;
  /** Petite étiquette affichée sur la carte (ex. « Signature ») */
  badge?: string;
  tags: string[];
  spice: Spice;
  available: boolean;
  /** Ordre de popularité (plus grand = plus populaire) */
  popularity: number;
  prepMinutes: number | null;
  photo: string | null;
  /** true = photo d'illustration, pas une photo du restaurant */
  photoIsIllustration: boolean;
  model: Model3D | null;
};

const demoModel = (file: string, label: string, sizeKb: number): Model3D => ({
  glb: `/models/demo/${file}.glb`,
  label,
  isDemo: true,
  sizeKb,
  arEnabled: true,
});

export const demoDishes: DemoDish[] = [
  {
    slug: "poisson-braise-attieke",
    name: "Poisson braisé & attiéké",
    description: "Poisson grillé au feu de bois, attiéké, alloco, oignons et piment frais.",
    price: 6500,
    category: "grillades",
    badge: "Signature",
    tags: ["Attiéké", "Feu de bois"],
    spice: "moyen",
    available: true,
    popularity: 98,
    prepMinutes: 25,
    photo: "/demo/poisson-braise-alloco.jpg",
    photoIsIllustration: true,
    model: demoModel("carved_wooden_plate", "Plat de service en bois sculpté", 428),
  },
  {
    slug: "kedjenou-poulet",
    name: "Kedjenou de poulet",
    description: "Poulet mijoté à l'étouffée avec légumes et épices, cuit au canari.",
    price: 8000,
    category: "plats",
    badge: "Cuisson canari",
    tags: ["Étouffée", "Poulet"],
    spice: "doux",
    available: true,
    popularity: 95,
    prepMinutes: 30,
    photo: "/demo/kedjenou.jpg",
    photoIsIllustration: true,
    model: demoModel("ceramic_pot", "Marmite en terre cuite, type canari", 524),
  },
  {
    slug: "alloco",
    name: "Alloco",
    description: "Banane plantain mûre frite, sauce tomate pimentée.",
    price: 2500,
    category: "accompagnements",
    badge: "Partage",
    tags: ["Plantain mûr", "Sauce maison"],
    spice: "moyen",
    available: true,
    popularity: 97,
    prepMinutes: 10,
    photo: "/demo/alloco.jpg",
    photoIsIllustration: true,
    model: demoModel("bananas", "Régime de bananes", 1414),
  },
  {
    slug: "sauce-graine",
    name: "Sauce graine",
    description: "Sauce à la noix de palme, viande et poisson fumé, servie avec riz ou foutou.",
    price: 7500,
    category: "plats",
    tags: ["Noix de palme", "Poisson fumé"],
    spice: "moyen",
    available: true,
    popularity: 90,
    prepMinutes: 20,
    photo: "/demo/sauce-graine.jpg",
    photoIsIllustration: true,
    model: demoModel("wooden_bowl_01", "Bol en bois tourné", 731),
  },
  {
    slug: "riz-gras-poulet",
    name: "Riz gras au poulet",
    description: "Riz cuit dans une sauce tomate parfumée, poulet doré.",
    price: 5000,
    category: "plats",
    tags: ["Riz", "Poulet"],
    spice: "doux",
    available: true,
    popularity: 88,
    prepMinutes: 20,
    photo: "/demo/riz-gras-poulet.jpg",
    photoIsIllustration: true,
    model: null,
  },
  {
    slug: "sauce-feuille-foutou",
    name: "Sauce feuille & foutou",
    description: "Sauce aux feuilles, viande et poisson fumé, foutou banane.",
    price: 7000,
    category: "plats",
    badge: "Tradition",
    tags: ["Feuilles", "Foutou banane"],
    spice: "doux",
    available: false,
    popularity: 84,
    prepMinutes: 25,
    photo: "/demo/sauce-feuille-foutou.jpg",
    photoIsIllustration: true,
    model: null,
  },
  {
    slug: "brochettes",
    name: "Brochettes grillées",
    description: "Viandes marinées grillées au charbon, piment et légumes.",
    price: 4500,
    category: "grillades",
    tags: ["Charbon", "Marinade"],
    spice: "fort",
    available: true,
    popularity: 86,
    prepMinutes: 15,
    photo: "/demo/brochettes.jpg",
    photoIsIllustration: true,
    model: null,
  },
  {
    slug: "bissap",
    name: "Bissap",
    description: "Infusion de fleurs d'hibiscus, servie bien fraîche.",
    price: 1500,
    category: "boissons",
    tags: ["Hibiscus", "Fait maison"],
    spice: "doux",
    available: true,
    popularity: 80,
    prepMinutes: null,
    photo: "/demo/bissap.jpg",
    photoIsIllustration: true,
    model: null,
  },
];

export const findDemoDish = (slug: string) => demoDishes.find((d) => d.slug === slug);

export const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

export const spiceLabel: Record<Spice, string> = { doux: "Doux", moyen: "Moyen", fort: "Fort" };

/** Visuels d'ambiance (illustration) */
export const demoAmbiance = {
  hero: "/demo/hero-poisson-feuille.jpg",
  partage: "/demo/table-partage.jpg",
};
