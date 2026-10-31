"use client";

import { useEffect, useState } from "react";
import { IconPlus } from "@/components/ui/icons";

/** Champ photo avec aperçu (prise de vue directe sur téléphone). */
export function PhotoField({ fichier, onChange, requis = true }: { fichier: File | null; onChange: (f: File | null) => void; requis?: boolean }) {
  const [apercu, setApercu] = useState<string | null>(null);
  useEffect(() => {
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [fichier]);
  return (
    <label className="group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-or/50 bg-surface-basse text-center hover:border-or">
      {fichier && apercu ? (
        // Aperçu local (blob:), pas d'optimisation possible
        // eslint-disable-next-line @next/next/no-img-element
        <img src={apercu} alt="Aperçu de la photo choisie" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <span className="grid size-12 place-items-center rounded-full bg-or-sombre text-or">
            <IconPlus width={22} height={22} />
          </span>
          <span className="mt-3 text-body-md text-ivoire">Ajouter la photo du plat</span>
          <span className="mt-1 px-6 text-body-sm text-texte/55">Vue de dessus, plat centré, bonne lumière. JPEG, PNG ou WebP.</span>
        </>
      )}
      {fichier && <span className="absolute right-2 bottom-2 rounded-full bg-noir/75 px-3 py-1 text-label-sm text-ivoire">Changer</span>}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={requis && !fichier}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </label>
  );
}
