"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { brand } from "@/config/site";
import { IconBike, IconCarte, IconChef, IconClose, IconGrid, IconMenu, IconReceipt, IconTable } from "@/components/ui/icons";

const sections = [
  { titre: "Pilotage", liens: [{ href: "/admin", label: "Tableau de bord", Icon: IconGrid }] },
  {
    titre: "Opérations",
    liens: [
      { href: "/admin/commandes", label: "Commandes", Icon: IconReceipt },
      { href: "/admin/cuisine", label: "Cuisine (KDS)", Icon: IconChef },
      { href: "/admin/livraisons", label: "Livraisons", Icon: IconBike },
      { href: "/admin/reservations", label: "Salle & réservations", Icon: IconTable },
    ],
  },
  { titre: "Carte", liens: [{ href: "/admin/carte", label: "Carte & 3D", Icon: IconCarte }] },
];

const actif = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function Liens({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Espace du personnel" className="flex flex-col gap-0.5 px-3">
      {sections.map((s) => (
        <div key={s.titre} className="mb-3">
          <p className="px-3 pb-1.5 text-label-sm text-texte/40 uppercase">{s.titre}</p>
          {s.liens.map(({ href, label, Icon }) => {
            const a = actif(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={a ? "page" : undefined}
                className={`flex h-10 items-center gap-3 rounded-lg border-l-2 px-3 text-body-md transition-colors ${
                  a ? "border-or bg-surface-haute font-semibold text-ivoire" : "border-transparent text-texte/70 hover:bg-surface hover:text-ivoire"
                }`}
              >
                <Icon width={18} height={18} className="shrink-0 text-or" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Marque() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <Image src={brand.logo.or} alt="" width={40} height={40} className="size-10" />
      <span className="flex flex-col">
        <span className="font-display text-title tracking-[0.08em] text-ivoire">LE-TCHE</span>
        <span className="text-label-sm text-or uppercase">Espace du personnel</span>
      </span>
    </Link>
  );
}

/** Barre latérale (ordinateur) + tiroir (téléphone/tablette). */
export function AdminNav({ pied }: { pied: ReactNode }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [dernier, setDernier] = useState(pathname);
  if (pathname !== dernier) {
    setDernier(pathname);
    setOuvert(false);
  }
  useEffect(() => {
    if (!ouvert) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [ouvert]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-or/15 bg-encre lg:flex">
        <div>
          <div className="flex h-18 items-center border-b border-or/15 px-5 py-4">
            <Marque />
          </div>
          <div className="pt-5">
            <Liens pathname={pathname} />
          </div>
        </div>
        <div className="border-t border-or/15 p-4">{pied}</div>
      </aside>

      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={ouvert}
        className="verre-survol fixed top-3 left-3 z-50 grid size-11 place-items-center rounded-full text-or lg:hidden"
      >
        <IconMenu />
      </button>
      <div onClick={() => setOuvert(false)} aria-hidden className={`fixed inset-0 z-50 bg-noir/60 backdrop-blur-sm transition-opacity lg:hidden ${ouvert ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        inert={!ouvert}
        aria-label="Menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-72 flex-col justify-between border-r border-or/15 bg-encre transition-transform duration-300 lg:hidden ${ouvert ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-or/15 px-4 py-4">
            <Marque />
            <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer le menu" className="grid size-10 place-items-center rounded-full text-texte/70">
              <IconClose width={20} height={20} />
            </button>
          </div>
          <div className="pt-4">
            <Liens pathname={pathname} />
          </div>
        </div>
        <div className="border-t border-or/15 p-4">{pied}</div>
      </aside>
    </>
  );
}
