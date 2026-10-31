"use client";

import { useRef, useState, useTransition } from "react";
import { createDish } from "@/lib/actions/carte";
import { compresserPhoto } from "./photo";
import { PhotoField } from "./PhotoField";
import { IconCube, IconPlus } from "@/components/ui/icons";

const champ = "mt-1 w-full rounded-lg border border-ligne bg-surface-basse px-3 text-body-md text-texte outline-none placeholder:text-texte/35 focus:border-or focus:ring-1 focus:ring-or";
const libelle = "text-label-md text-texte/80";

/** Ajout d'un plat : informations + photo réelle → aperçu 3D généré automatiquement. */
export function NewDishForm({ categories }: { categories: { id: string; label: string }[] }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const formulaire = useRef<HTMLFormElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [etape, setEtape] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  function ouvrir() {
    formulaire.current?.reset();
    setPhoto(null);
    setErreur(null);
    setEtape(null);
    dialogue.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={ouvrir} className="inline-flex h-11 items-center gap-2 rounded-full bg-or px-5 text-label-md text-noir uppercase shadow-carte hover:bg-or-clair">
        <IconPlus width={18} height={18} /> Nouveau plat
      </button>
      <dialog
        ref={dialogue}
        onCancel={(e) => enCours && e.preventDefault()}
        aria-labelledby="titre-nouveau-plat"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-ligne bg-surface p-0 text-texte shadow-flottant backdrop:bg-noir/70 backdrop:backdrop-blur-sm"
      >
        <form
          ref={formulaire}
          onSubmit={(e) => {
            e.preventDefault();
            setErreur(null);
            if (!photo) return setErreur("Ajoutez une photo du plat.");
            const donnees = new FormData(e.currentTarget);
            demarrer(async () => {
              try {
                setEtape("Préparation de la photo…");
                donnees.set("photo", await compresserPhoto(photo), "photo.jpg");
              } catch {
                return setErreur("Cette image n'a pas pu être lue. Essayez une autre photo.");
              }
              setEtape(donnees.get("avec3d") ? "Envoi et création de l'aperçu 3D…" : "Envoi…");
              const r = await createDish(donnees);
              setEtape(null);
              if (r.ok) dialogue.current?.close();
              else setErreur(r.error);
            });
          }}
          className="flex flex-col"
        >
          <div className="border-b border-ligne px-5 pt-5 pb-4 sm:px-6">
            <p className="surtitre text-champagne">Carte</p>
            <h2 id="titre-nouveau-plat" className="text-headline-sm text-or">
              Ajouter un plat
            </h2>
            <p className="text-body-sm text-texte/60">Le plat apparaît sur le site client dès l&apos;enregistrement, avec son aperçu 3D.</p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <PhotoField fichier={photo} onChange={setPhoto} />
              <label className="flex items-start gap-3 rounded-lg bg-surface-basse p-3">
                <input type="checkbox" name="photoReelle" defaultChecked className="mt-0.5 size-4 accent-or" />
                <span className="text-body-sm">
                  <span className="block text-ivoire">Photo réelle du plat servi au restaurant</span>
                  <span className="text-texte/55">Décochez s&apos;il s&apos;agit d&apos;une photo d&apos;illustration : le site l&apos;indiquera.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg bg-surface-basse p-3">
                <input type="checkbox" name="avec3d" defaultChecked className="mt-0.5 size-4 accent-or" />
                <span className="text-body-sm">
                  <span className="flex items-center gap-1.5 text-ivoire">
                    <IconCube width={15} height={15} className="text-or" /> Créer l&apos;aperçu 3D et la réalité augmentée
                  </span>
                  <span className="text-texte/55">La photo est posée sur une assiette modélisée en 3D (ce n&apos;est pas un scan).</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block">
                <span className={libelle}>Nom du plat *</span>
                <input name="name" required maxLength={80} placeholder="Ex. Garba au thon" className={`${champ} h-11`} />
              </label>
              <label className="block">
                <span className={libelle}>Catégorie *</span>
                <select name="category" required defaultValue={categories[0]?.id} className={`${champ} h-11`}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={libelle}>Description</span>
                <textarea name="description" rows={3} maxLength={400} placeholder="Ingrédients, cuisson, accompagnement…" className={`${champ} resize-none py-2`} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={libelle}>Prix (FCFA)</span>
                  <input name="price" inputMode="numeric" pattern="\d*" maxLength={7} placeholder="Prix à venir" className={`${champ} prix h-11`} />
                </label>
                <label className="block">
                  <span className={libelle}>Préparation (min)</span>
                  <input name="prepMinutes" inputMode="numeric" pattern="\d*" maxLength={3} placeholder="Ex. 20" className={`${champ} prix h-11`} />
                </label>
                <label className="block">
                  <span className={libelle}>Piment</span>
                  <select name="spice" defaultValue="doux" className={`${champ} h-11`}>
                    <option value="doux">Doux</option>
                    <option value="moyen">Moyen</option>
                    <option value="fort">Fort</option>
                  </select>
                </label>
                <label className="block">
                  <span className={libelle}>Étiquette</span>
                  <input name="badge" maxLength={30} placeholder="Ex. Nouveau" className={`${champ} h-11`} />
                </label>
              </div>
              <label className="block">
                <span className={libelle}>Mots-clés (séparés par des virgules)</span>
                <input name="tags" maxLength={120} placeholder="Ex. Thon, Attiéké, Fait maison" className={`${champ} h-11`} />
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="available" defaultChecked className="size-4 accent-or" />
                <span className="text-body-md">Disponible à la commande dès maintenant</span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-ligne bg-surface/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {(erreur || etape) && (
              <p role={erreur ? "alert" : "status"} className={`text-body-sm sm:mr-auto ${erreur ? "text-erreur" : "text-champagne"}`}>
                {erreur ?? etape}
              </p>
            )}
            <button type="button" disabled={enCours} onClick={() => dialogue.current?.close()} className="h-11 rounded-full border border-ligne px-5 text-label-md text-texte uppercase hover:border-or disabled:opacity-50">
              Annuler
            </button>
            <button disabled={enCours} aria-busy={enCours} className="h-11 rounded-full bg-or px-6 text-label-md text-noir uppercase hover:bg-or-clair disabled:opacity-60">
              {enCours ? "Enregistrement…" : "Ajouter à la carte"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
