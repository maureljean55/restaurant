import type { ReactNode } from "react";

const tones = {
  vert: "bg-vert text-ivoire",
  sable: "bg-sable text-cacao",
  sauge: "bg-sauge/40 text-vert",
  /** Contenu provisoire : à remplacer avant la mise en ligne. */
  provisoire: "border border-dashed border-terracotta bg-ivoire text-terracotta",
} as const;

export function Badge({ tone = "sable", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
