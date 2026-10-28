import Link from "next/link";
import { nav, site } from "@/config/site";

export function SiteFooter() {
  const titre = "surtitre text-or";
  return (
    <footer className="bg-vert pb-[calc(5rem+env(safe-area-inset-bottom))] text-ivoire/75 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 md:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-4">
          <p className="font-display text-headline-sm text-ivoire">{site.name.value}</p>
          <p className="mt-3 max-w-xs text-body-sm">{site.description.value}</p>
        </div>
        <div className="lg:col-span-2">
          <p className={titre}>Navigation</p>
          <ul className="mt-4 space-y-1 text-body-sm">
            {[...nav, { href: "/panier", label: "Panier" }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center hover:text-ivoire">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-3">
          <p className={titre}>Nous trouver</p>
          <address className="mt-4 space-y-2 text-body-sm not-italic">
            <p>{site.address.value}</p>
            <p>{site.phone.value}</p>
            <p>{site.email.value}</p>
          </address>
        </div>
        <div className="lg:col-span-3">
          <p className={titre}>Horaires</p>
          <dl className="mt-4 space-y-2 text-body-sm">
            {site.hours.value.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 border-b border-ivoire/10 pb-2">
                <dt>{h.days}</dt>
                <dd className="text-ivoire">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="border-t border-ivoire/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-label-sm font-medium text-ivoire/55 sm:flex-row sm:justify-between md:px-8 lg:px-12">
          <p>Visuels, prix et coordonnées provisoires — site en préparation.</p>
          <p className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-ivoire">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ivoire">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
