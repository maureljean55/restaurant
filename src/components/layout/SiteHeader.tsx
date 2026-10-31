"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { IconBag, IconCalendar, IconCarte, IconClose, IconCube, IconHome, IconMenu, IconPin } from "@/components/ui/icons";

const navIcons = { "/": IconHome, "/menu": IconCarte, "/experience-3d": IconCube, "/reservation": IconCalendar } as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/panier"
      aria-label={count ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier (vide)"}
      className="relative grid size-11 place-items-center rounded-full text-or transition-colors hover:bg-surface-haute"
    >
      <IconBag />
      {count > 0 && (
        <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-or px-1 text-[10px] leading-none font-bold text-noir">
          {count}
        </span>
      )}
    </Link>
  );
}

/** En-tête fixe translucide (maquette Stitch) + tiroir de navigation sur téléphone/tablette. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-fond/85 pt-[env(safe-area-inset-top)] shadow-[0_1px_8px_rgb(74_46_36/0.06)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:px-8 lg:h-[4.5rem] lg:px-12">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            aria-controls="tiroir-navigation"
            className="-ml-1 grid size-11 place-items-center rounded-full text-or hover:bg-surface-haute lg:hidden"
          >
            <IconMenu />
          </button>

          <Link href="/" className="mr-auto flex min-w-0 items-center gap-2.5" aria-label={`${site.name.value} — accueil`}>
            <Image src={site.logo.medaillon} alt="" width={48} height={48} priority className="size-10 shrink-0 drop-shadow-sm lg:size-12" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-title tracking-[0.08em] text-or lg:text-[1.3rem]">{site.name.value}</span>
              <span className="flex items-center gap-0.5 text-label-sm font-semibold text-texte/60">
                <IconPin width={12} height={12} className="text-or" />
                {site.area.value}
              </span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={`relative block px-4 py-2 text-label-lg transition-colors ${
                      isActive(pathname, item.href) ? "text-or" : "text-texte/70 hover:text-or"
                    } after:absolute after:inset-x-4 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-or ${
                      isActive(pathname, item.href) ? "after:block" : "after:hidden"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <CartButton />
          <Link
            href="/reservation"
            className="ml-1 hidden h-11 items-center gap-2 rounded-full bg-or px-5 text-label-md uppercase text-noir shadow-carte transition-colors hover:bg-or-clair md:inline-flex"
          >
            <IconCalendar width={18} height={18} />
            Réserver
          </Link>
        </div>
      </header>

      {/* Fond assombri + tiroir latéral */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-noir/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      <aside
        id="tiroir-navigation"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-80 flex-col justify-between bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-flottant transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex h-16 items-center justify-between px-4">
            <span className="flex items-center gap-2 font-display text-title tracking-[0.08em] text-or">
              <Image src={site.logo.medaillon} alt="" width={36} height={36} className="size-9" />
              {site.name.value}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="grid size-11 place-items-center rounded-full text-texte/70 hover:text-texte"
            >
              <IconClose width={22} height={22} />
            </button>
          </div>
          <div className="px-4 py-2">
            <p className="flex items-center gap-1.5 rounded-full bg-surface-basse px-3 py-1.5 text-label-sm text-texte/70">
              <IconPin width={14} height={14} className="text-or" />
              {site.address.value}
            </p>
          </div>
          <nav aria-label="Navigation principale" className="flex flex-col px-2 pt-1">
            {nav.map((item) => {
              const Icon = navIcons[item.href];
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-12 items-center gap-4 rounded-xl px-4 text-label-lg transition-colors ${
                    active ? "bg-surface-basse text-or" : "text-texte/70 hover:bg-surface-basse hover:text-or"
                  }`}
                >
                  <Icon width={22} height={22} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/panier"
              className={`flex h-12 items-center gap-4 rounded-xl px-4 text-label-lg transition-colors ${
                isActive(pathname, "/panier") ? "bg-surface-basse text-or" : "text-texte/70 hover:bg-surface-basse hover:text-or"
              }`}
            >
              <IconBag width={22} height={22} />
              Panier
            </Link>
          </nav>
        </div>
        <div className="mx-2 mb-2 rounded-t-xl bg-surface-basse p-4">
          <p className="surtitre text-texte/60">Horaires</p>
          {site.hours.value.map((h) => (
            <p key={h.days} className="mt-1 text-body-sm text-texte">
              {h.days} · {h.time}
            </p>
          ))}
        </div>
      </aside>
    </>
  );
}
