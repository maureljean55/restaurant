"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { btn } from "@/components/ui/styles";
import { IconBag, IconCheck, IconPlus } from "@/components/ui/icons";
import { formatFCFA } from "@/lib/format";

type Props = {
  slug: string;
  name: string;
  price: number | null;
  available: boolean;
  /** « compact » sur les cartes, « large » pour le bouton pleine largeur */
  variant?: "compact" | "large";
};

export function AddToCartButton({ slug, name, price, available, variant = "compact" }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const disabled = !available || price === null;
  const label = !available ? "Indisponible" : price === null ? "Prix à venir" : added ? "Ajouté" : "Ajouter";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(slug);
        setAdded(true);
      }}
      aria-label={disabled ? `${name} : ${label}` : `Ajouter ${name} au panier`}
      className={`${btn.primary} ${variant === "large" ? `${btn.md} w-full` : "h-9 px-3.5"} ${added ? "!bg-vert !text-ivoire" : ""}`}
    >
      {added ? <IconCheck width={16} height={16} /> : variant === "large" ? <IconBag width={18} height={18} /> : <IconPlus width={16} height={16} />}
      <span aria-live="polite">
        {variant === "large" && !added && !disabled ? `Commander ce plat · ${formatFCFA(price!)}` : label}
      </span>
    </button>
  );
}
