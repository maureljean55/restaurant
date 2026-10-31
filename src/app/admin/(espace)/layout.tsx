import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "@/lib/actions/auth";
import { getStaff } from "@/lib/supabase/auth";
import { IconLogout, IconSearch } from "@/components/ui/icons";

/** Coquille de l'espace du personnel : barre latérale, barre du haut, contenu. */
export default function EspaceLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminNav
        pied={
          <div className="flex items-center justify-between text-label-sm text-texte/45">
            <Link href="/" className="hover:text-or">
              Voir le site ↗
            </Link>
            <span className="text-or/80">Abidjan · UTC+0</span>
          </div>
        }
      />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-ligne bg-fond/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 pr-4 pl-16 md:pr-8 lg:h-18 lg:pl-8">
            <form action="/admin/commandes" className="relative max-w-md flex-1">
              <IconSearch width={16} height={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texte/45" />
              <label className="sr-only" htmlFor="recherche-admin">
                Rechercher une commande
              </label>
              <input
                id="recherche-admin"
                name="q"
                type="search"
                placeholder="N° de commande, nom, téléphone…"
                className="h-10 w-full rounded-lg border border-ligne bg-surface pr-3 pl-9 text-body-sm text-texte outline-none placeholder:text-texte/40 focus:border-or"
              />
            </form>
            <Suspense fallback={<span className="ml-auto h-10 w-40 animate-pulse rounded-lg bg-surface" />}>
              <Utilisateur />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[90rem] px-4 py-6 md:px-8 lg:py-8">{children}</main>
      </div>
    </>
  );
}

async function Utilisateur() {
  const membre = await getStaff();
  if (!membre) return null;
  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-or-sombre font-display text-title text-or ring-1 ring-or/50">
        {membre.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-body-sm font-semibold text-ivoire">{membre.name}</span>
        <span className="text-label-sm text-or">{membre.role === "admin" ? "Administrateur" : "Personnel"}</span>
      </span>
      <form action={signOut}>
        <button aria-label="Se déconnecter" title="Se déconnecter" className="verre-survol grid size-10 place-items-center rounded-full text-texte/70 hover:text-or">
          <IconLogout width={18} height={18} />
        </button>
      </form>
    </div>
  );
}
