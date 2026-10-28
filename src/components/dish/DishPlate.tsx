import Image from "next/image";

type Props = {
  name: string;
  /** Photo vue de dessus, recadrée en cercle. null → assiette vide « Photo à venir ». */
  photo: string | null;
  /** Rotation lente de l'assiette (désactivée si l'utilisateur réduit les animations). */
  spin?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Signature visuelle du site : le plat présenté dans une assiette, vu de dessus.
 * Les photos officielles devront suivre ce cadrage (vue zénithale, assiette centrée).
 */
export function DishPlate({ name, photo, spin = false, sizes = "50vw", priority, className = "" }: Props) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div className={`assiette absolute inset-0 ${spin ? "animate-tourne" : ""}`}>
        <div className="assiette-liseret absolute inset-0" aria-hidden />
        {photo && (
          <Image
            src={photo}
            alt={name}
            fill
            sizes={sizes}
            priority={priority}
            className="rounded-full object-cover"
          />
        )}
      </div>
      {!photo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="sr-only">{name} : </span>
          <span className="surtitre text-[0.6rem] text-cacao/60 sm:text-[0.65rem]">Photo à venir</span>
        </div>
      )}
    </div>
  );
}
