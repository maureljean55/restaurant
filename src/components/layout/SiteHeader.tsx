"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";
import { IconArrow, IconBag, IconClose, IconMenu } from "@/components/ui/icons";

/**
 * En-tête flottant en forme de pilule.
 * - Transparent sur la photo d'accueil, verre dépoli vert dès qu'on défile.
 * - Se cache quand on descend, réapparaît quand on remonte.
 * - Téléphone : menu plein écran.
 * Occupe une hauteur nulle : chaque page réserve elle-même l'espace en haut.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Ferme le menu mobile après une navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 320 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const solid = scrolled || pathname !== "/";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 h-0">
      <div
        className={`px-3 pt-3 transition-transform duration-500 sm:px-5 lg:pt-4 ${
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
        <div
          className={`mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full border pr-1.5 pl-5 text-ivoire transition-[background-color,border-color,box-shadow] duration-500 lg:h-16 lg:pl-7 ${
            solid
              ? "border-ivoire/10 bg-vert/85 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] backdrop-blur-xl"
              : "border-ivoire/15 bg-charbon/15 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="mr-auto flex items-baseline gap-2 font-display text-lg lg:text-xl">
            {site.name.value}
            {site.name.placeholder && (
              <span className="hidden rounded-full border border-dashed border-or/70 px-1.5 font-sans text-[0.55rem] font-bold uppercase tracking-wider text-or xl:inline">
                provisoire
              </span>
            )}
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full bg-ivoire/[0.06] p-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive(item.href) ? "bg-ivoire text-vert" : "text-ivoire/80 hover:bg-ivoire/10 hover:text-ivoire"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/panier"
            className="relative ml-1 grid size-11 place-items-center rounded-full transition-colors hover:bg-ivoire/10"
            aria-label="Panier (vide)"
          >
            <IconBag width={22} height={22} />
          </Link>

          <Link
            href="/menu"
            className="group hidden h-11 items-center gap-2 rounded-full bg-orange pr-1.5 pl-5 text-sm font-bold text-charbon transition-colors hover:bg-orange-clair md:inline-flex lg:h-12"
          >
            Commander
            <span className="grid size-8 place-items-center rounded-full bg-charbon text-orange transition-transform group-hover:-rotate-45 lg:size-9">
              <IconArrow width={16} height={16} />
            </span>
          </Link>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-ivoire text-vert lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose width={22} height={22} /> : <IconMenu width={22} height={22} />}
          </button>
        </div>
      </div>

      {/* Menu plein écran (téléphone et tablette) */}
      <div
        id="menu-mobile"
        className={`grain fixed inset-0 -z-10 flex flex-col bg-vert px-6 pt-28 pb-10 text-ivoire transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Navigation principale">
          <ul>
            {nav.map((item, i) => (
              <li
                key={item.href}
                className={`border-b border-ivoire/10 transition-[opacity,translate] duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              >
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-18 items-center justify-between py-3 font-display text-[2.6rem] leading-none"
                >
                  {item.label}
                  <IconArrow className={isActive(item.href) ? "text-orange" : "text-ivoire/30"} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <Link
            href="/menu"
            className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-orange font-bold text-charbon"
          >
            <IconBag width={20} height={20} /> Commander
          </Link>
          <p className="text-center text-sm text-ivoire/60">
            {site.phone.value} · {site.address.value}
          </p>
        </div>
      </div>
    </header>
  );
}
