import Link from "next/link";
import { nav, site } from "@/config/site";

/** Pied de page compact : identité, navigation, coordonnées et horaires. */
export function SiteFooter() {
  return (
    <footer className="bg-vert pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-body-sm text-ivoire/70 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 md:grid-cols-3 md:gap-8 md:px-8 lg:px-12">
        <div>
          <p className="font-display text-title text-ivoire">{site.name.value}</p>
          <p className="mt-0.5 text-label-sm font-medium text-ivoire/55">{site.tagline.value}</p>
        </div>

        <nav aria-label="Pied de page">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {[...nav, { href: "/panier", label: "Panier" }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-ivoire">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-0.5 md:text-right">
          <p>{site.address.value}</p>
          <p>
            {site.phone.value} · {site.email.value}
          </p>
          <p className="text-ivoire/55">{site.hours.value.map((h) => `${h.days} : ${h.time}`).join(" · ")}</p>
        </div>
      </div>

      <div className="border-t border-ivoire/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-label-sm font-medium text-ivoire/45 md:px-8 lg:px-12">
          <p>Visuels, prix et coordonnées provisoires.</p>
          <p className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-ivoire">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ivoire">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
