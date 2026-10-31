/** Styles de boutons partagés (DESIGN.md), à combiner avec une taille. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-label-md uppercase transition-[background-color,color,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btn = {
  /** Action principale : or, texte noir (comme le logo). */
  primary: `${base} bg-or text-noir shadow-carte hover:bg-or-clair`,
  /** Action secondaire : contour or sur fond sombre. */
  secondary: `${base} border-[1.5px] border-or/70 bg-surface-haute text-or shadow-carte hover:border-or hover:bg-or-sombre`,
  outline: `${base} border-[1.5px] border-or text-or hover:bg-or hover:text-noir`,
  ghostLight: `${base} border border-ivoire/30 text-ivoire hover:bg-ivoire hover:text-noir`,
  md: "h-12 px-6",
  sm: "h-10 px-4",
} as const;

/** Carte sombre à fin liseré (écrin noir et or) */
export const carte = "rounded-xl border border-ligne/70 bg-surface shadow-carte";

/** Petite pastille d'information */
export const pastille = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm";
