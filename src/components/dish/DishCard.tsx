import Image from "next/image";
import Link from "next/link";
import { spiceLabel, type Dish } from "@/lib/catalogue/types";
import { formatFCFA } from "@/lib/format";
import { carte, pastille } from "@/components/ui/styles";
import { IconCube, IconFire, IconLeaf } from "@/components/ui/icons";
import { AddToCartButton } from "./AddToCartButton";

/**
 * Carte de plat (maquettes Stitch « Plats signatures » et « La Carte »).
 * - signature : prix sur la photo, lien « Voir en 3D » en pied de carte.
 * - carte : prix à côté du titre, niveau de piment, 2 ingrédients, bouton Ajouter.
 */
export function DishCard({ dish, variant = "carte", categoryLabel }: { dish: Dish; variant?: "signature" | "carte"; categoryLabel?: string }) {
  const prix = dish.price === null ? "Prix à venir" : formatFCFA(dish.price);

  return (
    <article
      className={`${carte} group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-carte-survol ${
        dish.available ? "" : "opacity-75"
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-surface-haute sm:h-52">
        {dish.photo && (
          <Image
            src={dish.photo}
            alt={dish.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/45 via-transparent to-transparent" aria-hidden />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {dish.model && (
            <span className={`${pastille} bg-or text-noir shadow-sm`}>
              <IconCube width={13} height={13} />
              {variant === "signature" ? "Modèle 3D disponible" : "Modèle 3D"}
            </span>
          )}
          {!dish.available && <span className={`${pastille} bg-noir/80 text-ivoire`}>Indisponible</span>}
        </div>

        {dish.photoIsIllustration && (
          <span className="absolute bottom-2.5 left-3 text-[0.65rem] font-medium text-ivoire/85">Photo d&apos;illustration</span>
        )}

        <span className={`${pastille} absolute right-3 bottom-2.5 bg-surface/90 text-texte shadow-sm backdrop-blur-md`}>
          {variant === "signature" ? (
            <span className="prix text-label-md text-champagne">{prix}</span>
          ) : (
            <>
              {dish.spice === "doux" ? <IconLeaf width={13} height={13} className="text-or" /> : <IconFire width={13} height={13} className={dish.spice === "fort" ? "text-champagne" : "text-or"} />}
              Piment {spiceLabel[dish.spice].toLowerCase()}
            </>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-title leading-snug ${variant === "signature" ? "text-or" : "text-texte"}`}>{dish.name}</h3>
          {variant === "carte" ? (
            <span className="prix shrink-0 text-label-lg text-or">{prix}</span>
          ) : (
            dish.badge && <span className={`${pastille} shrink-0 bg-surface-haute font-semibold text-texte/80`}>{dish.badge}</span>
          )}
        </div>
        <p className="line-clamp-2 text-body-sm text-texte/75">{dish.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {variant === "carte" ? (
            <div className="flex min-w-0 flex-wrap gap-1">
              {dish.tags.map((t) => (
                <span key={t} className={`${pastille} bg-surface-basse text-texte/75`}>
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <span className="flex items-center gap-1 text-label-sm text-texte/65">
              <IconLeaf width={15} height={15} className="text-or" />
              {dish.tags[0] ?? categoryLabel}
            </span>
          )}

          {variant === "signature" && dish.model ? (
            <Link
              href={`/experience-3d?plat=${dish.slug}`}
              className="flex shrink-0 items-center gap-1 text-label-md text-champagne underline decoration-or decoration-1 underline-offset-4 hover:text-or"
            >
              <IconCube width={15} height={15} />
              Voir en 3D
            </Link>
          ) : (
            <AddToCartButton slug={dish.slug} name={dish.name} price={dish.price} available={dish.available} />
          )}
        </div>
      </div>
    </article>
  );
}
