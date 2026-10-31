"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { isActive } from "./SiteHeader";
import { IconBag, IconCalendar, IconCarte, IconCube, IconHome } from "@/components/ui/icons";

/** Barre d'onglets du bas (téléphone uniquement), avec « Réserver » mis en avant au centre. */
export function BottomTabBar() {
  const pathname = usePathname();
  const { count } = useCart();

  const tab = (href: string, label: string, Icon: typeof IconHome, badge?: number) => {
    const active = isActive(pathname, href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative flex w-14 flex-col items-center justify-center gap-1 text-label-sm transition-colors ${
          active ? "text-or" : "text-texte/60 hover:text-or"
        }`}
      >
        <Icon width={23} height={23} />
        {label}
        {!!badge && (
          <span className="absolute -top-1 right-2 grid h-4 min-w-4 place-items-center rounded-full bg-or px-1 text-[10px] leading-none font-bold text-noir">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 bg-fond/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(74_46_36/0.07)] backdrop-blur-xl md:hidden"
    >
      <div className="flex h-[4.5rem] items-center justify-around gap-1 px-2">
        {tab("/", "Accueil", IconHome)}
        {tab("/menu", "Carte", IconCarte)}
        <Link
          href="/reservation"
          aria-current={isActive(pathname, "/reservation") ? "page" : undefined}
          className="flex h-11 items-center gap-2 rounded-full bg-or px-4 text-label-md uppercase text-noir shadow-carte xs:px-5"
        >
          <IconCalendar width={19} height={19} />
          Réserver
        </Link>
        {tab("/experience-3d", "3D", IconCube)}
        {tab("/panier", "Panier", IconBag, count)}
      </div>
    </nav>
  );
}
