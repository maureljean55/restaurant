import Link from "next/link";
import { nav, site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-charbon text-ivoire/80">
      <div className="bande-tissee opacity-60" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl text-ivoire">{site.name.value}</p>
          <p className="mt-2 text-sm">{site.tagline.value}</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed">{site.description.value}</p>
        </div>

        <div>
          <p className="surtitre text-or">Plan du site</p>
          <ul className="mt-4 space-y-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-10 items-center hover:text-ivoire">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="surtitre text-or">Nous trouver</p>
          <address className="mt-4 space-y-2 text-sm not-italic">
            <p>{site.address.value}</p>
            <p>{site.phone.value}</p>
            <p>{site.email.value}</p>
          </address>
        </div>
      </div>
      <div className="border-t border-ivoire/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ivoire/60 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
          <p>Visuels et coordonnées provisoires — site en préparation.</p>
          <p className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-ivoire">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ivoire">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
