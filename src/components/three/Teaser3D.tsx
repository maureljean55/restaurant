"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DemoDish } from "@/data/demo-dishes";
import { ModelViewer } from "./ModelViewer";
import { btn } from "@/components/ui/styles";
import { IconArrow, IconCube, IconDevices, IconRotate, IconSearch } from "@/components/ui/icons";

const atouts = [
  { Icon: IconRotate, titre: "Rotation à 360°", texte: "Faites tourner le plat du bout du doigt." },
  { Icon: IconSearch, titre: "Zoom sur les détails", texte: "Textures, garnitures, portions." },
  { Icon: IconCube, titre: "Sur votre table", texte: "Posez-le chez vous en réalité augmentée." },
];

/** Encart d'accueil : présentation de l'expérience 3D avec un vrai visualiseur interactif. */
export function Teaser3D({ plats }: { plats: DemoDish[] }) {
  const [actif, setActif] = useState(plats[0]);
  const scene = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Le moteur 3D n'est chargé que lorsque l'encart approche de l'écran.
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), obs.disconnect()), { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="grid overflow-hidden rounded-2xl border border-ligne bg-surface text-ivoire shadow-flottant lg:grid-cols-12">
      {/* Texte */}
      <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:p-12">
        <p className="surtitre flex items-center gap-2 text-or">
          <span className="h-px w-6 bg-or" aria-hidden />
          Expérience 3D &amp; réalité augmentée
        </p>
        <h2 id="teaser-3d" className="mt-3 text-headline-md lg:text-headline-lg">
          Vivez votre assiette en 360° avant de commander
        </h2>
        <p className="mt-3 text-body-md text-ivoire/75">
          Découvrez chaque plat sous tous les angles, puis visualisez-le à taille réelle sur votre table.
        </p>

        <ul className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {atouts.map(({ Icon, titre, texte }) => (
            <li key={titre} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-ivoire/15 bg-ivoire/5 text-or">
                <Icon width={20} height={20} />
              </span>
              <span>
                <span className="block text-label-lg text-ivoire">{titre}</span>
                <span className="block text-body-sm text-ivoire/65">{texte}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-auto lg:pt-10">
          <Link href={`/experience-3d?plat=${actif.slug}`} className={`${btn.primary} ${btn.md} shrink-0 whitespace-nowrap`}>
            Lancer l&apos;expérience 3D
            <IconArrow width={16} height={16} />
          </Link>
          <p className="flex items-center gap-2 text-label-sm font-medium text-ivoire/55">
            <IconDevices width={16} height={16} className="shrink-0" />
            iPhone · Android · sans application
          </p>
        </div>
      </div>

      {/* Scène 3D */}
      <div className="relative min-h-[22rem] bg-[radial-gradient(ellipse_at_center,#2b2414_0%,#14120e_55%,#050505_100%)] sm:min-h-[26rem] lg:col-span-7 lg:min-h-[32rem]">
        <div ref={scene} className="absolute inset-0">
          {visible ? (
            <ModelViewer
              key={actif.model!.glb}
              src={actif.model!.glb}
              alt={`${actif.name}, aperçu 3D`}
              fallbackPhoto={actif.photo}
              ar={false}
              className="absolute inset-0"
            />
          ) : (
            actif.photo && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative aspect-square w-1/2 overflow-hidden rounded-full opacity-40">
                  <Image src={actif.photo} alt="" fill sizes="30vw" className="object-cover" />
                </div>
              </div>
            )
          )}
        </div>

        <span className="pointer-events-none absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-ivoire/15 bg-encre/60 px-3 py-1.5 text-label-sm text-ivoire/85 backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-or" />
          Aperçu interactif · faites-le tourner
        </span>

        {/* Choix du plat */}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-display text-title text-ivoire">{actif.name}</p>
          <div className="flex shrink-0 gap-2" role="radiogroup" aria-label="Plat affiché en 3D">
            {plats.map((p) => (
              <button
                key={p.slug}
                type="button"
                role="radio"
                aria-checked={p.slug === actif.slug}
                aria-label={p.name}
                onClick={() => setActif(p)}
                className={`relative size-11 overflow-hidden rounded-full ring-2 transition ${
                  p.slug === actif.slug ? "ring-or" : "opacity-70 ring-ivoire/25 hover:opacity-100"
                }`}
              >
                {p.photo && <Image src={p.photo} alt="" fill sizes="44px" className="object-cover" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
