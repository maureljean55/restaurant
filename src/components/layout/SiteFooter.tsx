import Link from "next/link";
import { nav, site, whatsappUrl } from "@/config/site";
import { IconArrow, IconBag } from "@/components/ui/icons";

export function SiteFooter() {
  const wa = whatsappUrl();
  const socials = Object.entries(site.social.value).filter(([, url]) => url);
  const titre = "surtitre text-[0.68rem] text-or";

  return (
    <footer className="grain relative mt-8 overflow-hidden rounded-t-[2.5rem] bg-charbon pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-ivoire/75 md:pb-0 lg:rounded-t-[4rem]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Appel à l'action */}
        <div className="flex flex-col gap-8 border-b border-ivoire/10 py-14 md:flex-row md:items-end md:justify-between lg:py-20">
          <div>
            <p className={titre}>Une petite faim ?</p>
            <p className="mt-3 max-w-xl font-display text-4xl leading-[1.05] text-ivoire sm:text-5xl lg:text-6xl">
              Le menu vous attend. Commandez en quelques gestes.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 xs:flex-row">
            <Link
              href="/menu"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-orange pr-2 pl-6 font-bold text-charbon transition-colors hover:bg-orange-clair"
            >
              <IconBag width={20} height={20} />
              Commander
              <span className="grid size-10 place-items-center rounded-full bg-charbon text-orange transition-transform group-hover:-rotate-45">
                <IconArrow width={16} height={16} />
              </span>
            </Link>
            <Link
              href="/reservation"
              className="inline-flex h-14 items-center justify-center rounded-full border border-ivoire/25 px-6 font-bold text-ivoire transition-colors hover:bg-ivoire hover:text-charbon"
            >
              Réserver une table
            </Link>
          </div>
        </div>

        {/* Colonnes */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="font-display text-2xl text-ivoire">{site.name.value}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">{site.description.value}</p>
            <div className="mt-6 flex gap-2">
              {socials.length > 0 ? (
                socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border border-ivoire/15 text-xs font-bold capitalize hover:bg-ivoire hover:text-charbon"
                  >
                    {name.slice(0, 2)}
                  </a>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-ivoire/20 px-3 py-1.5 text-xs text-ivoire/50">
                  Réseaux sociaux à venir
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className={titre}>Navigation</p>
            <ul className="mt-4 space-y-1 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-10 items-center transition-[color,translate] hover:translate-x-1 hover:text-ivoire">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className={titre}>Nous trouver</p>
            <address className="mt-4 space-y-2 text-sm not-italic">
              <p>{site.address.value}</p>
              <p>
                <a href={`tel:${site.phone.value.replace(/\s/g, "")}`} className="hover:text-ivoire">
                  {site.phone.value}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email.value}`} className="hover:text-ivoire">
                  {site.email.value}
                </a>
              </p>
              {wa && (
                <p>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="font-bold text-orange hover:underline">
                    WhatsApp
                  </a>
                </p>
              )}
            </address>
          </div>

          <div className="lg:col-span-3">
            <p className={titre}>Horaires</p>
            <dl className="mt-4 space-y-2 text-sm">
              {site.hours.value.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-ivoire/10 pb-2">
                  <dt>{h.days}</dt>
                  <dd className="text-ivoire">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Nom du restaurant en très grand, décoratif : le SVG l'ajuste à la largeur, quelle que soit sa longueur */}
      <svg viewBox="0 0 1000 150" className="-mb-[2%] block w-full px-3 select-none" aria-hidden>
        <text
          x="500"
          y="128"
          textAnchor="middle"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          className="fill-transparent font-display"
          vectorEffect="non-scaling-stroke"
          style={{ fontSize: 150, stroke: "rgb(198 161 91 / 0.4)", strokeWidth: 1 }}
        >
          {site.name.value}
        </text>
      </svg>

      <div className="relative border-t border-ivoire/10 bg-charbon">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-ivoire/50 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Visuels et coordonnées provisoires — site en préparation.</p>
          <div className="flex items-center gap-5">
            <Link href="/mentions-legales" className="hover:text-ivoire">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-ivoire">Confidentialité</Link>
            <a
              href="#contenu"
              className="inline-flex items-center gap-2 rounded-full border border-ivoire/15 px-3 py-1.5 text-ivoire/70 hover:bg-ivoire hover:text-charbon"
            >
              Haut de page
              <IconArrow width={14} height={14} className="-rotate-90" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
