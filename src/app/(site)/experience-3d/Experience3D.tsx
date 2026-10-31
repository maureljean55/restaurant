"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { categoryLabel, spiceLabel, type DemoDish } from "@/data/demo-dishes";
import { formatFCFA } from "@/lib/format";
import { ModelViewer, type ModelViewerHandle } from "@/components/three/ModelViewer";
import { AddToCartButton } from "@/components/dish/AddToCartButton";
import { pastille } from "@/components/ui/styles";
import {
  IconClose,
  IconCube,
  IconDevices,
  IconInfo,
  IconMinus,
  IconMoon,
  IconPlus,
  IconReset,
  IconRotate,
  IconSun,
} from "@/components/ui/icons";

const outil =
  "grid size-9 place-items-center rounded-full text-texte transition-colors hover:bg-surface-haute focus-visible:outline-offset-1";

export function Experience3D({ plats }: { plats: DemoDish[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const viewer = useRef<ModelViewerHandle>(null);

  const plat = plats.find((p) => p.slug === params.get("plat")) ?? plats[0];
  const [eclairage, setEclairage] = useState<"jour" | "soir">("jour");
  const [aide, setAide] = useState(true);
  const [ar, setAr] = useState<null | "non-supporte" | "echec">(null);

  const choisir = (slug: string) => {
    setAr(null);
    setAide(true);
    router.replace(`${pathname}?plat=${slug}`, { scroll: false });
  };

  const onInteract = useCallback(() => setAide(false), []);
  const onArStatus = useCallback((s: "non-supporte" | "lance" | "echec") => setAr(s === "lance" ? null : s), []);

  if (!plat?.model) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-center">Aucun modèle 3D n&apos;est encore disponible.</p>;
  }
  const model = plat.model;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-16 md:px-8 md:pt-8 lg:px-12 lg:pb-24">
      {/* Introduction */}
      <section className="max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-or-sombre text-champagne">
            <IconCube width={13} height={13} />
          </span>
          <p className="surtitre text-champagne">Atelier 3D</p>
        </div>
        <h1 className="mt-1.5 text-headline-md text-texte md:text-headline-lg">Visualisation 3D &amp; réalité augmentée</h1>
        <p className="mt-1 text-body-sm text-texte/70 md:text-body-md">
          Faites pivoter le plat, zoomez sur les détails, puis posez-le sur votre table avec un téléphone compatible.
        </p>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:gap-8">
        {/* Scène 3D */}
        <section aria-label="Visualiseur 3D" className="lg:col-span-7">
          <div className="overflow-hidden rounded-xl bg-surface-haute shadow-flottant">
            <div
              className={`relative h-[22rem] select-none sm:h-[28rem] lg:h-[34rem] ${
                eclairage === "jour"
                  ? "bg-gradient-to-b from-surface-basse via-surface-haute to-ligne"
                  : "bg-gradient-to-b from-noir via-encre to-noir"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(196_164_103/0.12)_0%,transparent_65%)]" aria-hidden />

              <ModelViewer
                key={model.glb}
                ref={viewer}
                src={model.glb}
                iosSrc={model.usdz}
                alt={`${plat.name} — ${model.label}`}
                fallbackPhoto={plat.photo}
                ar={model.arEnabled}
                lighting={eclairage}
                onInteract={onInteract}
                onArStatus={onArStatus}
                className="absolute inset-0"
              />

              <span className={`${pastille} absolute top-3 left-3 z-10 bg-surface/90 text-or shadow-sm backdrop-blur-md`}>
                <IconInfo width={14} height={14} />
                {model.isDemo ? "Aperçu 3D provisoire" : "Modèle 3D validé"}
              </span>

              {aide && (
                <span className="pointer-events-none absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-noir/80 px-3 py-1.5 text-label-sm whitespace-nowrap text-ivoire backdrop-blur-md">
                  <IconRotate width={15} height={15} className="text-or" />
                  Glissez pour pivoter à 360°
                </span>
              )}

              {/* Commandes */}
              <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between">
                <div className="flex items-center gap-0.5 rounded-full bg-surface/90 p-1 shadow-sm backdrop-blur-md">
                  <button type="button" aria-label="Zoomer" className={outil} onClick={() => viewer.current?.zoom(0.8)}>
                    <IconPlus width={18} height={18} />
                  </button>
                  <button type="button" aria-label="Dézoomer" className={outil} onClick={() => viewer.current?.zoom(1.25)}>
                    <IconMinus width={18} height={18} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      viewer.current?.reset();
                      setAide(true);
                    }}
                    className="flex h-9 items-center gap-1 rounded-full bg-surface/90 px-3 text-label-sm text-texte/80 shadow-sm backdrop-blur-md hover:text-texte"
                  >
                    <IconReset width={15} height={15} />
                    Recentrer
                  </button>
                  <button
                    type="button"
                    aria-label={eclairage === "jour" ? "Éclairage du soir" : "Éclairage de jour"}
                    aria-pressed={eclairage === "soir"}
                    onClick={() => setEclairage((e) => (e === "jour" ? "soir" : "jour"))}
                    className={`${outil} bg-surface/90 shadow-sm backdrop-blur-md ${eclairage === "soir" ? "text-champagne" : ""}`}
                  >
                    {eclairage === "jour" ? <IconMoon width={17} height={17} /> : <IconSun width={17} height={17} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Réalité augmentée */}
            {model.arEnabled && (
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-noir via-encre to-noir p-3 text-ivoire sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ivoire/10 text-champagne">
                    <IconCube width={22} height={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-label-md text-champagne">Réalité augmentée</p>
                    <p className="truncate text-body-sm text-ivoire/75">Posez le plat sur votre table</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => viewer.current?.activateAR()}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-or px-4 text-label-md uppercase text-noir shadow-carte active:scale-95"
                >
                  Sur votre table
                </button>
              </div>
            )}
          </div>

          {ar && (
            <div role="alert" className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-surface-haute p-3 text-texte shadow-carte">
              <div className="flex gap-2">
                <IconDevices width={22} height={22} className="shrink-0 text-champagne" />
                <p className="text-body-sm">
                  {ar === "non-supporte"
                    ? "La réalité augmentée n'est pas disponible sur cet appareil. Ouvrez cette page sur un iPhone (Safari) ou un téléphone Android compatible ARCore. Vous pouvez toujours faire pivoter le plat ici et commander."
                    : "La réalité augmentée n'a pas pu démarrer. Vérifiez l'accès à la caméra, puis réessayez sur une surface plane et bien éclairée."}
                </p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setAr(null)} className="grid size-7 shrink-0 place-items-center rounded-full text-texte/60 hover:text-texte">
                <IconClose width={18} height={18} />
              </button>
            </div>
          )}
        </section>

        {/* Fiche du plat */}
        <section aria-labelledby="fiche-plat" className="lg:col-span-5">
          <div className="flex flex-col gap-4 rounded-xl border border-ligne/70 bg-surface p-4 shadow-carte sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {plat.badge && <span className={`${pastille} bg-or-sombre text-champagne`}>{plat.badge}</span>}
                  <span className="text-label-sm text-texte/60">{categoryLabel(plat.category)}</span>
                </div>
                <h2 id="fiche-plat" className="text-headline-sm leading-snug text-texte">
                  {plat.name}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="prix font-display text-title text-or">{plat.price === null ? "Prix à venir" : formatFCFA(plat.price)}</p>
                <p className="text-label-sm font-medium text-texte/55">Prix d&apos;exemple</p>
              </div>
            </div>
            <p className="text-body-md text-texte/80">{plat.description}</p>

            <div>
              <p className="surtitre text-texte">Ingrédients clés</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plat.tags.map((t) => (
                  <span key={t} className={`${pastille} bg-surface-basse text-texte/75`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Piment", spiceLabel[plat.spice]],
                ["Préparation", plat.prepMinutes ? `≈ ${plat.prepMinutes} min` : "—"],
                ["Fichier 3D", `${(model.sizeKb / 1024).toFixed(1).replace(".", ",")} Mo`],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col-reverse rounded-lg bg-surface-basse p-2">
                  <dt className="text-label-sm font-medium text-texte/60">{k}</dt>
                  <dd className="text-body-sm font-semibold text-texte">{v}</dd>
                </div>
              ))}
            </dl>

            {model.isDemo && (
              <p className="flex gap-2 rounded-lg border border-dashed border-champagne/60 bg-or-sombre/40 p-3 text-body-sm text-texte/80">
                <IconInfo width={16} height={16} className="mt-0.5 shrink-0 text-champagne" />
                <span>
                  <strong>Aperçu provisoire</strong> : la photo d&apos;illustration du plat est posée sur une assiette
                  en 3D. Ce n&apos;est pas un scan ; le vrai modèle 3D sera créé après la séance de prise de vue.
                </span>
              </p>
            )}

            <AddToCartButton slug={plat.slug} name={plat.name} price={plat.price} available={plat.available} variant="large" />
          </div>
        </section>
      </div>

      {/* Galerie des plats modélisés */}
      <section aria-labelledby="galerie" className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="galerie" className="text-title text-texte md:text-headline-sm">
              Galerie des plats en 3D
            </h2>
            <p className="text-body-sm text-texte/65">Choisissez une assiette pour charger son modèle</p>
          </div>
          <span className={`${pastille} shrink-0 bg-or-sombre text-or`}>
            {plats.length} modèle{plats.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {plats.map((p) => {
            const actif = p.slug === plat.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => choisir(p.slug)}
                aria-pressed={actif}
                className={`w-44 shrink-0 snap-start rounded-xl bg-surface p-2.5 text-left shadow-carte transition-all md:w-auto ${
                  actif ? "ring-2 ring-or" : "hover:bg-surface-basse"
                }`}
              >
                <span className="relative mb-2 block h-28 overflow-hidden rounded-lg bg-surface-haute md:h-32">
                  {p.photo && <Image src={p.photo} alt="" fill sizes="(min-width: 768px) 20vw, 176px" className="object-cover" />}
                  <span className={`absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${actif ? "bg-or text-noir" : "bg-surface/90 text-texte"}`}>
                    {actif ? "Affiché" : "3D"}
                  </span>
                </span>
                <span className="block truncate text-label-md text-texte">{p.name}</span>
                <span className="prix block text-body-sm font-semibold text-champagne">{p.price === null ? "Prix à venir" : formatFCFA(p.price)}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-texte/60">
                  <IconCube width={12} height={12} className="text-or" />
                  {(p.model!.sizeKb / 1024).toFixed(1).replace(".", ",")} Mo · RA {p.model!.arEnabled ? "oui" : "non"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Compatibilité */}
      <section className="mt-6 flex items-start gap-3 rounded-xl bg-surface-basse p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-haute text-texte/70">
          <IconDevices width={19} height={19} />
        </span>
        <div>
          <p className="text-label-md text-texte">Compatibilité</p>
          <p className="mt-0.5 text-body-sm text-texte/70">
            3D : tous les navigateurs récents. Réalité augmentée : iPhone avec Safari (AR Quick Look) et téléphones
            Android compatibles ARCore (Scene Viewer), sans application à installer. Sur les autres appareils, la vue
            3D et la commande restent disponibles.
          </p>
        </div>
      </section>
    </div>
  );
}
