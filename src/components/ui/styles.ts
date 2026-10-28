/** Styles de boutons partagés (DESIGN.md), à combiner avec une taille. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-label-md uppercase transition-[background-color,color,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btn = {
  /** Action principale : orange, texte charbon (le blanc n'est pas assez contrasté). */
  primary: `${base} bg-orange text-charbon shadow-carte hover:bg-orange-clair`,
  secondary: `${base} bg-vert text-ivoire shadow-carte hover:bg-vert-fonce`,
  outline: `${base} border-[1.5px] border-vert text-vert hover:bg-vert hover:text-ivoire`,
  ghostLight: `${base} border border-ivoire/30 text-ivoire hover:bg-ivoire hover:text-vert`,
  md: "h-12 px-6",
  sm: "h-10 px-4",
} as const;

/** Carte blanche à bordure sable (DESIGN.md) */
export const carte = "rounded-xl border border-sable/70 bg-blanc shadow-carte";

/** Petite pastille d'information */
export const pastille = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm";
