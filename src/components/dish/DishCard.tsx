import Link from "next/link";
import type { DemoDish } from "@/data/demo-dishes";
import { formatFCFA } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { DishPlate } from "./DishPlate";

export function DishCard({ dish }: { dish: DemoDish }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-blanc shadow-[0_1px_0_rgb(0_0_0/0.04),0_12px_30px_-18px_rgb(74_46_36/0.45)]">
      <div className="table-bois relative p-6 sm:p-7">
        <DishPlate
          name={dish.name}
          photo={dish.photo}
          sizes="(min-width: 1024px) 22vw, (min-width: 768px) 40vw, 70vw"
          className="mx-auto w-full max-w-56 transition-transform duration-500 group-hover:rotate-12"
        />
        {dish.has3d && (
          <span className="absolute top-3 right-3">
            <Badge tone="vert">3D</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="surtitre text-[0.65rem] text-vert/70">{dish.category}</p>
        <h3 className="text-xl leading-tight text-charbon">
          <Link href={`/menu/${dish.slug}`} className="after:absolute after:inset-0">
            {dish.name}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-charbon/75">{dish.description}</p>
        <p className="mt-auto pt-3 font-bold text-cacao">
          {dish.price === null ? <span className="text-charbon/50">Prix à venir</span> : formatFCFA(dish.price)}
        </p>
      </div>
    </article>
  );
}
