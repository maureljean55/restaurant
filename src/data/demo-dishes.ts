/**
 * DONNÉES DE DÉMONSTRATION — à remplacer par le menu réel.
 *
 * Les noms sont des classiques de la cuisine ivoirienne, utilisés pour
 * tester la mise en page. Ce n'est PAS la carte du restaurant :
 * prix, descriptions et disponibilités sont à fournir.
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
  has3d: boolean;
  hasAr: boolean;
};

export const demoDishes: DemoDish[] = [
  {
    slug: "poisson-braise-attieke",
    name: "Poisson braisé & attiéké",
    description: "Poisson grillé au feu de bois, attiéké, oignons et piment frais.",
    price: null,
    category: "Grillades",
    photo: null,
    has3d: false,
    hasAr: false,
  },
  {
    slug: "kedjenou-poulet",
    name: "Kedjenou de poulet",
    description: "Poulet mijoté à l'étouffée avec légumes et épices.",
    price: null,
    category: "Plats traditionnels",
    photo: null,
    has3d: false,
    hasAr: false,
  },
  {
    slug: "garba",
    name: "Garba",
    description: "Attiéké et thon frit, piment, tomate et oignon.",
    price: null,
    category: "Plats traditionnels",
    photo: null,
    has3d: false,
    hasAr: false,
  },
  {
    slug: "alloco",
    name: "Alloco",
    description: "Banane plantain mûre frite, sauce pimentée.",
    price: null,
    category: "Accompagnements",
    photo: null,
    has3d: false,
    hasAr: false,
  },
  {
    slug: "sauce-graine",
    name: "Sauce graine",
    description: "Sauce à la noix de palme, servie avec riz ou foutou.",
    price: null,
    category: "Plats traditionnels",
    photo: null,
    has3d: false,
    hasAr: false,
  },
  {
    slug: "bissap",
    name: "Bissap",
    description: "Infusion de fleurs d'hibiscus, servie bien fraîche.",
    price: null,
    category: "Boissons",
    photo: null,
    has3d: false,
    hasAr: false,
  },
];
