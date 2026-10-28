import Image from "next/image";

type Props = {
  name: string;
  /** Photo du plat, posée dans le creux de l'assiette. */
  photo: string | null;
  sizes?: string;
  className?: string;
};

/** Le plat présenté dans une assiette en céramique, vu de dessus. */
export function DishPlate({ name, photo, sizes = "30vw", className = "" }: Props) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div className="assiette absolute inset-0">
        {photo && (
          <div className="absolute inset-[11%] overflow-hidden rounded-full [mask-image:radial-gradient(closest-side,#000_96.5%,transparent_100%)]">
            <Image src={photo} alt={name} fill sizes={sizes} className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
