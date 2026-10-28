/**
 * DONNÉES DE DÉMONSTRATION — à remplacer par le menu réel.
 *
 * Les noms sont des classiques de la cuisine ivoirienne, utilisés pour
 * tester la mise en page. Ce n'est PAS la carte du restaurant :
 * prix, descriptions et disponibilités sont à fournir.
 *
 * Les photos sont des PHOTOS D'ILLUSTRATION (Unsplash, licence libre),
 * pas des plats du restaurant. Sources : docs/visuels-provisoires.md
 * Ce fichier disparaîtra quand les plats viendront de Supabase.
 */

export type DemoDish = {
  slug: string;
  name: string;
  description: string;
  /** null = prix non encore communiqué */
  price: number | null;
  category: string;
  photo: string | null;
  /** true = photo d'illustration, pas une photo du restaurant */
  photoIsIllustration: boolean;
  has3d: boolean;
  hasAr: boolean;
};

const dish = (d: Omit<DemoDish, "price" | "photoIsIllustration" | "has3d" | "hasAr">): DemoDish => ({
  price: null,
  photoIsIllustration: true,
  has3d: false,
  hasAr: false,
  ...d,
});

export const demoDishes: DemoDish[] = [
  dish({
    slug: "poisson-braise-attieke",
    name: "Poisson braisé & attiéké",
    description: "Poisson grillé au feu de bois, attiéké, alloco, oignons et piment frais.",
    category: "Grillades",
    photo: "/demo/poisson-braise-alloco.jpg",
  }),
  dish({
    slug: "kedjenou-poulet",
    name: "Kedjenou de poulet",
    description: "Poulet mijoté à l'étouffée avec légumes et épices.",
    category: "Plats traditionnels",
    photo: "/demo/kedjenou.jpg",
  }),
  dish({
    slug: "riz-gras-poulet",
    name: "Riz gras au poulet",
    description: "Riz cuit dans une sauce tomate parfumée, poulet doré.",
    category: "Plats traditionnels",
    photo: "/demo/riz-gras-poulet.jpg",
  }),
  dish({
    slug: "alloco",
    name: "Alloco",
    description: "Banane plantain mûre frite, sauce pimentée.",
    category: "Accompagnements",
    photo: "/demo/alloco.jpg",
  }),
  dish({
    slug: "sauce-graine",
    name: "Sauce graine",
    description: "Sauce à la noix de palme, servie avec riz ou foutou.",
    category: "Plats traditionnels",
    photo: "/demo/sauce-graine.jpg",
  }),
  dish({
    slug: "sauce-feuille-foutou",
    name: "Sauce feuille & foutou",
    description: "Sauce aux feuilles, viande et poisson fumé, foutou banane.",
    category: "Plats traditionnels",
    photo: "/demo/sauce-feuille-foutou.jpg",
  }),
  dish({
    slug: "brochettes",
    name: "Brochettes grillées",
    description: "Viandes marinées grillées au charbon, piment et légumes.",
    category: "Grillades",
    photo: "/demo/brochettes.jpg",
  }),
  dish({
    slug: "bissap",
    name: "Bissap",
    description: "Infusion de fleurs d'hibiscus, servie bien fraîche.",
    category: "Boissons",
    photo: "/demo/bissap.jpg",
  }),
];

export const findDemoDish = (slug: string) => demoDishes.find((d) => d.slug === slug)!;

/** Visuels d'ambiance (illustration) */
export const demoAmbiance = {
  hero: "/demo/hero-poisson-feuille.jpg",
  partage: "/demo/table-partage.jpg",
};
