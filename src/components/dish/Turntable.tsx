"use client";

import { useRef, useState, type PointerEvent } from "react";
import { DishPlate } from "./DishPlate";

type Plat = { name: string; photo: string };

/**
 * Plateau tournant en perspective : une table en bois inclinée qui tourne lentement,
 * avec les assiettes posées dessus. Sur ordinateur, le plateau suit légèrement la souris.
 * Purement décoratif : l'expérience 3D réelle passera par <model-viewer> sur la fiche plat.
 */
export function Turntable({ centre, autour }: { centre: Plat; autour: Plat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2, // -1 → 1
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative aspect-square w-full [perspective:1300px] [&_.assiette]:outline [&_.assiette]:outline-1 [&_.assiette]:outline-transparent [&_.assiette]:[backface-visibility:hidden]"
    >
      {/* Ombre portée du plateau */}
      <div className="absolute inset-x-[8%] bottom-[6%] h-[22%] rounded-[50%] bg-black/45 blur-2xl" aria-hidden />

      <div
        className="absolute inset-0 transition-transform duration-700 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${46 - tilt.y * 8}deg) rotateY(${tilt.x * 8}deg)` }}
      >
        {/* Le plateau en bois, avec sa tranche */}
        <div className="absolute inset-[6%] translate-y-[2.5%] rounded-full bg-[#2e1c16]" aria-hidden />
        <div className="table-bois absolute inset-[6%] animate-plateau rounded-full shadow-[inset_0_0_0_6px_rgb(198_161_91/0.35),inset_0_0_60px_rgb(0_0_0/0.45)] [transform-style:preserve-3d]">
          <div className="absolute inset-[3%] rounded-full border border-dashed border-or/25" aria-hidden />

          <div className="absolute top-1/2 left-1/2 w-[40%] -translate-x-1/2 -translate-y-1/2">
            <DishPlate name={centre.name} photo={centre.photo} sizes="(min-width: 768px) 20vw, 40vw" />
          </div>

          {autour.map((p, i) => (
            <div
              key={p.name}
              className="absolute top-1/2 left-1/2 w-[27%]"
              style={{ transform: `translate(-50%, -50%) rotate(${(360 / autour.length) * i}deg) translateY(-124%)` }}
            >
              <DishPlate name={p.name} photo={p.photo} sizes="(min-width: 768px) 14vw, 28vw" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
