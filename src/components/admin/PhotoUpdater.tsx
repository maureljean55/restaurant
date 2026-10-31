"use client";

import { useRef, useState, useTransition } from "react";
import { updateDishPhoto } from "@/lib/actions/carte";
import { compresserPhoto } from "./photo";
import { PhotoField } from "./PhotoField";
import { IconCube } from "@/components/ui/icons";

/** Remplacer la photo d'un plat (photo réelle) et régénérer son aperçu 3D. */
export function PhotoUpdater({ slug, nom }: { slug: string; nom: string }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPhoto(null);
          setErreur(null);
          dialogue.current?.showModal();
        }}
        aria-label={`Photo et 3D de ${nom}`}
        title="Photo & 3D"
        className="grid size-9 place-items-center rounded-full border border-ligne text-texte hover:border-or hover:text-or"
      >
        <IconCube width={16} height={16} />
      </button>
      <dialog
        ref={dialogue}
        onCancel={(e) => enCours && e.preventDefault()}
        aria-labelledby={`photo-${slug}`}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-ligne bg-surface p-0 text-texte shadow-flottant backdrop:bg-noir/70 backdrop:backdrop-blur-sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErreur(null);
            if (!photo) return setErreur("Choisissez une photo.");
            const donnees = new FormData(e.currentTarget);
            demarrer(async () => {
              try {
                donnees.set("photo", await compresserPhoto(photo), "photo.jpg");
              } catch {
                return setErreur("Cette image n'a pas pu être lue.");
              }
              const r = await updateDishPhoto(slug, donnees);
              if (r.ok) dialogue.current?.close();
              else setErreur(r.error);
            });
          }}
          className="flex flex-col gap-4 p-5"
        >
          <div>
            <p className="surtitre text-champagne">Photo & 3D</p>
            <h2 id={`photo-${slug}`} className="text-headline-sm text-or">
              {nom}
            </h2>
          </div>
          <PhotoField fichier={photo} onChange={setPhoto} />
          <label className="flex items-center gap-3 text-body-sm">
            <input type="checkbox" name="photoReelle" defaultChecked className="size-4 accent-or" /> Photo réelle du plat servi au restaurant
          </label>
          <label className="flex items-center gap-3 text-body-sm">
            <input type="checkbox" name="avec3d" defaultChecked className="size-4 accent-or" /> Régénérer l&apos;aperçu 3D à partir de cette photo
          </label>
          {erreur && (
            <p role="alert" className="text-body-sm text-erreur">
              {erreur}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={enCours} onClick={() => dialogue.current?.close()} className="h-11 rounded-full border border-ligne px-5 text-label-md text-texte uppercase hover:border-or">
              Annuler
            </button>
            <button disabled={enCours} aria-busy={enCours} className="h-11 rounded-full bg-or px-5 text-label-md text-noir uppercase hover:bg-or-clair disabled:opacity-60">
              {enCours ? "Envoi et 3D…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
