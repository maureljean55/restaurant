import Image from "next/image";
import Link from "next/link";
import type { DemoDish } from "@/data/demo-dishes";
import { formatFCFA } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { IconArrow } from "@/components/ui/icons";
import { DishPlate } from "./DishPlate";

export function DishCard({ dish }: { dish: DemoDish }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-blanc shadow-[0_1px_0_rgb(0_0_0/0.04),0_20px_40px_-24px_rgb(74_46_36/0.55)] transition-[translate,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_1px_0_rgb(0_0_0/0.04),0_30px_50px_-24px_rgb(74_46_36/0.6)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-cacao">
        {dish.photo ? (
          <Image
            src={dish.photo}
            alt={dish.name}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 75vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="table-bois absolute inset-0 grid place-items-center p-8">
            <DishPlate name={dish.name} photo={null} className="w-full max-w-48" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charbon/70 via-charbon/0 to-charbon/0" aria-hidden />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="verre rounded-full px-3 py-1 text-[0.7rem] font-bold text-ivoire">{dish.category}</span>
          {dish.has3d && <Badge tone="vert">3D</Badge>}
        </div>

        {dish.photoIsIllustration && (
          <span className="absolute bottom-3 left-4 text-[0.65rem] font-semibold tracking-wide text-ivoire/75">
            Photo d&apos;illustration
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[1.35rem] leading-tight text-charbon">
          <Link href={`/menu/${dish.slug}`} className="after:absolute after:inset-0">
            {dish.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-charbon/70">{dish.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="font-bold text-cacao">
            {dish.price === null ? <span className="font-semibold text-charbon/45">Prix à venir</span> : formatFCFA(dish.price)}
          </p>
          <span
            className="grid size-10 place-items-center rounded-full bg-orange text-charbon transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-[-8deg]"
            aria-hidden
          >
            <IconArrow width={18} height={18} />
          </span>
        </div>
      </div>
    </article>
  );
}
