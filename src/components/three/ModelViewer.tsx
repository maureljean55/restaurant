"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

export type ModelViewerHandle = {
  zoom: (factor: number) => void;
  reset: () => void;
  /** Lance la réalité augmentée. Renvoie false si l'appareil ne la prend pas en charge. */
  activateAR: () => Promise<boolean>;
};

type Props = {
  src: string;
  iosSrc?: string;
  alt: string;
  /** Photo affichée pendant le chargement et en cas d'échec. */
  fallbackPhoto: string | null;
  ar?: boolean;
  lighting?: "jour" | "soir";
  autoRotate?: boolean;
  onInteract?: () => void;
  onArStatus?: (status: "non-supporte" | "lance" | "echec") => void;
  className?: string;
};

/** Vue légèrement plongeante, comme assis devant son assiette. */
const ORBITE_INITIALE = "0deg 55deg auto";

/**
 * Visualiseur 3D (<model-viewer>), chargé uniquement côté navigateur et à la demande.
 * - 3D : rotation, zoom (pincer / molette), recentrage.
 * - RA : Scene Viewer / WebXR sur Android, Quick Look sur iPhone (USDZ généré si absent).
 * - En cas d'erreur : la photo du plat reste affichée.
 */
export const ModelViewer = forwardRef<ModelViewerHandle, Props>(function ModelViewer(
  { src, iosSrc, alt, fallbackPhoto, ar = true, lighting = "jour", autoRotate = true, onInteract, onArStatus, className = "" },
  ref,
) {
  const el = useRef<ModelViewerElement>(null);
  const [lib, setLib] = useState<"chargement" | "pret" | "erreur">("chargement");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"chargement" | "pret" | "erreur">("chargement");

  // La bibliothèque (≈ 1 Mo) n'est téléchargée que lorsqu'un visualiseur est affiché.
  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer")
      .then(() => !cancelled && setLib("pret"))
      .catch(() => !cancelled && setLib("erreur"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Nouveau modèle : on repart de l'état « chargement ».
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setState("chargement");
    setProgress(0);
  }

  useEffect(() => {
    const mv = el.current;
    if (!mv || lib !== "pret") return;
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => setState("pret");
    const onError = () => setState("erreur");
    const onCamera = (e: Event) => {
      if ((e as CustomEvent<{ source: string }>).detail.source === "user-interaction") onInteract?.();
    };
    const onAr = (e: Event) => {
      const s = (e as CustomEvent<{ status: string }>).detail.status;
      if (s === "failed") onArStatus?.("echec");
    };
    mv.addEventListener("progress", onProgress);
    mv.addEventListener("load", onLoad);
    mv.addEventListener("error", onError);
    mv.addEventListener("camera-change", onCamera);
    mv.addEventListener("ar-status", onAr);
    return () => {
      mv.removeEventListener("progress", onProgress);
      mv.removeEventListener("load", onLoad);
      mv.removeEventListener("error", onError);
      mv.removeEventListener("camera-change", onCamera);
      mv.removeEventListener("ar-status", onAr);
    };
  }, [lib, onInteract, onArStatus]);

  useImperativeHandle(ref, () => ({
    zoom(factor) {
      const mv = el.current;
      if (!mv) return;
      const o = mv.getCameraOrbit();
      mv.cameraOrbit = `${o.theta}rad ${o.phi}rad ${o.radius * factor}m`;
    },
    reset() {
      const mv = el.current;
      if (!mv) return;
      mv.cameraOrbit = ORBITE_INITIALE;
      mv.fieldOfView = "auto";
    },
    async activateAR() {
      const mv = el.current;
      if (!mv || !mv.canActivateAR) {
        onArStatus?.("non-supporte");
        return false;
      }
      await mv.activateAR();
      onArStatus?.("lance");
      return true;
    },
  }));

  const failed = lib === "erreur" || state === "erreur";

  return (
    // `className` doit positionner le conteneur (ex. « absolute inset-0 » ou « relative h-96 »).
    <div className={className || "relative h-96"}>
      {/* Photo de remplacement : pendant le chargement et en cas d'échec */}
      {fallbackPhoto && state !== "pret" && (
        <div className={`absolute inset-0 grid place-items-center transition-opacity ${failed ? "opacity-100" : "opacity-40"}`}>
          <div className="relative aspect-square w-3/5 overflow-hidden rounded-full shadow-flottant">
            <Image src={fallbackPhoto} alt={alt} fill sizes="40vw" className="object-cover" />
          </div>
        </div>
      )}

      {lib === "pret" && (
        <model-viewer
          ref={el}
          src={src}
          ios-src={iosSrc}
          alt={alt}
          loading="eager"
          camera-controls
          auto-rotate={autoRotate}
          auto-rotate-delay={2500}
          rotation-per-second="18deg"
          camera-orbit={ORBITE_INITIALE}
          min-camera-orbit="auto 0deg auto"
          max-camera-orbit="auto 88deg auto"
          interaction-prompt="none"
          touch-action="pan-y"
          shadow-intensity={1}
          shadow-softness={0.8}
          exposure={lighting === "jour" ? 1 : 0.75}
          environment-image={lighting === "jour" ? "neutral" : "legacy"}
          tone-mapping="aces"
          ar={ar}
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          className={`block size-full bg-transparent transition-opacity duration-500 [--poster-color:transparent] ${
            state === "pret" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Masque le bouton RA par défaut : on utilise le nôtre */}
          <span slot="ar-button" hidden />
        </model-viewer>
      )}

      {state === "chargement" && !failed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2" role="status">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-cacao/10">
            <div className="h-full rounded-full bg-vert transition-[width]" style={{ width: `${Math.max(8, progress * 100)}%` }} />
          </div>
          <span className="text-label-sm text-cacao/70">Chargement du modèle 3D…</span>
        </div>
      )}

      {failed && (
        <p role="alert" className="absolute inset-x-4 bottom-16 rounded-lg bg-blanc/95 p-3 text-center text-body-sm text-cacao shadow-carte">
          Le modèle 3D n&apos;a pas pu être chargé. La photo du plat reste disponible et vous pouvez commander normalement.
        </p>
      )}
    </div>
  );
});
