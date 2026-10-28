import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  /** Action principale (Commander). Texte charbon : le blanc sur orange n'est pas assez contrasté. */
  primary: "bg-orange text-charbon hover:bg-orange-clair",
  /** Action identitaire (Réserver). */
  secondary: "bg-vert text-ivoire hover:bg-vert-clair",
  outline: "border-2 border-vert text-vert hover:bg-vert hover:text-ivoire",
  /** Sur fond sombre (vert, cacao). */
  outlineLight: "border-2 border-ivoire/70 text-ivoire hover:bg-ivoire hover:text-cacao",
} as const;

const sizes = {
  md: "min-h-12 px-6 text-[0.95rem]",
  sm: "min-h-11 px-4 text-sm",
} as const;

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: Props) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
