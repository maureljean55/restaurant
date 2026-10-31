/** Création d'un plat depuis l'administration — logique pure (validation, identifiant). */
import { z } from "zod";

/** Identifiant d'adresse à partir du nom : « Poulet braisé & attiéké » → « poulet-braise-attieke ». */
export function slugify(nom: string): string {
  return (
    nom
      .replace(/œ/gi, "oe")
      .replace(/æ/gi, "ae")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "plat"
  );
}

/** Premier identifiant libre : slug, slug-2, slug-3… */
export function uniqueSlug(base: string, existants: Iterable<string>): string {
  const pris = new Set(existants);
  if (!pris.has(base)) return base;
  for (let i = 2; ; i++) if (!pris.has(`${base}-${i}`)) return `${base}-${i}`;
}

const optionnel = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const nouveauPlatSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le nom du plat").max(80),
  category: z.string().regex(/^[a-z0-9-]+$/, "Choisissez une catégorie"),
  description: z.string().trim().max(400, "400 caractères maximum").default(""),
  price: z.preprocess(optionnel, z.coerce.number().int("Prix en FCFA, sans centimes").min(0).max(1_000_000).nullable().default(null)),
  spice: z.enum(["doux", "moyen", "fort"]).default("doux"),
  prepMinutes: z.preprocess(optionnel, z.coerce.number().int().min(0).max(600).nullable().default(null)),
  badge: z.preprocess(optionnel, z.string().trim().max(30).nullable().default(null)),
  tags: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6),
    ),
  available: z.boolean().default(true),
  photoReelle: z.boolean().default(true),
  avec3d: z.boolean().default(true),
});

export type NouveauPlat = z.output<typeof nouveauPlatSchema>;

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_MAX_OCTETS = 4 * 1024 * 1024;

/** Libellé honnête de l'aperçu 3D selon l'origine de la photo. */
export const libelleApercu = (photoReelle: boolean) =>
  photoReelle ? "Aperçu 3D réalisé à partir de la photo du plat (assiette modélisée, pas un scan)" : "Aperçu 3D généré à partir de la photo d'illustration";
