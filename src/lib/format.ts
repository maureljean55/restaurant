const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 3500 → « 3 500 FCFA ». Montants toujours en francs CFA entiers. */
export function formatFCFA(amount: number): string {
  // Intl utilise une espace fine insécable ; on garde une espace normale insécable, plus lisible.
  return `${fcfa.format(amount).replace(/ /g, " ")} FCFA`;
}
