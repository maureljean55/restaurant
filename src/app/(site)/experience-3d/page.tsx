import type { Metadata } from "next";
import { Suspense } from "react";
import { demoDishes } from "@/data/demo-dishes";
import { Experience3D } from "./Experience3D";

export const metadata: Metadata = {
  title: "Expérience 3D & réalité augmentée",
  description: "Faites pivoter les plats à 360° et posez-les sur votre table en réalité augmentée.",
};

export default function Experience3DPage() {
  const plats = demoDishes.filter((d) => d.model);
  return (
    // Le plat choisi vient de l'adresse (?plat=…), lue dans le navigateur.
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl animate-pulse rounded-xl bg-surface-haute" />}>
      <Experience3D plats={plats} />
    </Suspense>
  );
}
