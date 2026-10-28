"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { IconBag, IconClose, IconMenu } from "@/components/ui/icons";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Ferme le menu mobile après une navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Sur l'accueil, l'en-tête est transparent au-dessus de la photo, puis devient plein au défilement.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const transparent = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 text-ivoire transition-[background-color,box-shadow] duration-300 ${
        transparent ? "bg-transparent" : "bg-vert shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        <Link href="/" className="mr-auto flex items-baseline gap-2">
          <span className="font-display text-xl lg:text-2xl">{site.name.value}</span>
          {site.name.placeholder && (
            <span className="hidden rounded-sm border border-dashed border-or/70 px-1 text-[0.6rem] font-bold uppercase tracking-wider text-or sm:inline">
              provisoire
            </span>
          )}
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-2 text-[0.95rem] font-semibold transition-colors hover:text-ivoire ${
                      active ? "text-ivoire" : "text-ivoire/75"
                    } after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-orange after:transition-transform ${
                      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ButtonLink href="/menu" size="sm" className="max-md:hidden">
          Commander
        </ButtonLink>

        <Link
          href="/panier"
          className="relative grid size-11 place-items-center rounded-full hover:bg-ivoire/10"
          aria-label="Panier (vide)"
        >
          <IconBag />
        </Link>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full hover:bg-ivoire/10 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Navigation principale" className="border-t border-ivoire/15 lg:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-14 items-center border-b border-ivoire/10 font-display text-2xl last:border-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
