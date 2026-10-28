import Link from "next/link";
import { site, whatsappUrl } from "@/config/site";
import { demoDishes } from "@/data/demo-dishes";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { DishCard } from "@/components/dish/DishCard";
import { DishPlate } from "@/components/dish/DishPlate";
import { IconArrow, IconClock, IconPhone, IconPin, IconRotate } from "@/components/ui/icons";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

export default function HomePage() {
  const populaires = demoDishes.slice(0, 4);
  const specialites = [demoDishes[0], demoDishes[1]];

  return (
    <>
      <Hero />

      {/* ───────── Plats populaires ───────── */}
      <section aria-labelledby="populaires" className="py-16 sm:py-20 lg:py-28">
        <div className={`${container} flex flex-wrap items-end justify-between gap-4`}>
          <div>
            <p className="surtitre text-terracotta">La carte</p>
            <h2 id="populaires" className="titre-section mt-3 text-vert">
              Les plats populaires
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Badge tone="provisoire">Exemples</Badge>
            <Link href="/menu" className="group inline-flex min-h-11 items-center gap-2 font-bold text-vert">
              Tout le menu
              <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Téléphone : défilement horizontal · Tablette : 2 colonnes · Ordinateur : 4 colonnes */}
        <ul
          className={`${container} mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-4 [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4`}
        >
          {populaires.map((dish) => (
            <li key={dish.slug} className="w-[78%] shrink-0 snap-start xs:w-[70%] sm:w-[46%] md:w-auto">
              <DishCard dish={dish} />
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Concept ───────── */}
      <section aria-labelledby="concept" className="bg-vert text-ivoire">
        <div className="bande-tissee opacity-50" aria-hidden />
        <div className={`${container} grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-28`}>
          <div className="lg:col-span-5">
            <p className="surtitre text-or">Le restaurant</p>
            <h2 id="concept" className="titre-section mt-3">
              Une table pour partager les saveurs de Côte d&apos;Ivoire
            </h2>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-dashed border-or/60 p-6 sm:p-8">
              <Badge tone="sable">Texte à fournir</Badge>
              <p className="mt-4 text-lg leading-relaxed text-ivoire/90">
                Ici : l&apos;histoire du restaurant, son équipe et ce qui fait sa cuisine. Quelques phrases
                sincères suffisent, avec une photo de la salle ou de l&apos;équipe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Expérience 3D ───────── */}
      <section aria-labelledby="experience-3d" className="table-bois overflow-hidden text-ivoire">
        <div className={`${container} grid items-center gap-12 py-16 sm:py-20 md:grid-cols-2 lg:py-28`}>
          <div className="relative mx-auto w-full max-w-sm md:order-2 md:max-w-md">
            <div
              className="absolute -inset-[7%] rounded-full border border-dashed border-or/50 animate-tourne [animation-direction:reverse]"
              aria-hidden
            />
            <DishPlate name="Plat en 3D" photo={null} spin sizes="(min-width: 768px) 40vw, 80vw" />
            <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-ivoire px-4 py-2 text-sm font-bold text-cacao shadow-lg">
              <IconRotate width={18} height={18} /> 360°
            </span>
          </div>

          <div>
            <p className="surtitre text-or">Expérience 3D</p>
            <h2 id="experience-3d" className="titre-section mt-3">
              Tournez autour du plat avant de commander
            </h2>
            <ol className="mt-8 space-y-5">
              {[
                ["Touchez « Voir en 3D »", "sur la fiche d'un plat qui porte le badge 3D."],
                ["Faites-le pivoter", "et zoomez du bout des doigts pour l'observer sous tous les angles."],
                ["Touchez « Voir sur ma table »", "sur un téléphone compatible pour le poser chez vous, en réalité augmentée."],
              ].map(([titre, texte], i) => (
                <li key={titre} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-or/60 font-display text-or">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-ivoire/80">
                    <strong className="font-bold text-ivoire">{titre}</strong> {texte}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-ivoire/60">
              Disponible bientôt pour une sélection de plats. La photo reste affichée sur les appareils non
              compatibles, et la commande fonctionne toujours.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Spécialités ───────── */}
      <section aria-labelledby="specialites" className="bg-sable/60 py-16 sm:py-20 lg:py-28">
        <div className={container}>
          <p className="surtitre text-terracotta">Spécialités</p>
          <h2 id="specialites" className="titre-section mt-3 max-w-2xl text-cacao">
            Ce que l&apos;on vient goûter chez nous
          </h2>

          <div className="mt-12 space-y-14 lg:space-y-20">
            {specialites.map((dish, i) => (
              <article key={dish.slug} className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
                <div className={`table-bois rounded-3xl p-8 sm:p-12 ${i % 2 ? "md:order-2" : ""}`}>
                  <DishPlate
                    name={dish.name}
                    photo={dish.photo}
                    sizes="(min-width: 768px) 40vw, 85vw"
                    className="mx-auto w-full max-w-sm"
                  />
                </div>
                <div>
                  <Badge tone="provisoire">Exemple</Badge>
                  <h3 className="mt-4 text-3xl text-cacao sm:text-4xl">{dish.name}</h3>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-charbon/80">{dish.description}</p>
                  <ButtonLink href={`/menu/${dish.slug}`} variant="outline" className="mt-8">
                    Voir le plat
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <InfosPratiques />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero" className="overflow-hidden">
      {/* Téléphone : titre → assiette → texte · Tablette/ordinateur : texte à gauche, assiette à droite */}
      <div
        className={`${container} grid gap-x-10 gap-y-8 pt-8 pb-16 [grid-template-areas:'titre'_'visuel'_'texte'] sm:pt-14 md:grid-cols-[1.1fr_1fr] md:gap-y-0 md:[grid-template-areas:'titre_visuel'_'texte_visuel'] lg:gap-x-16 lg:pt-20 lg:pb-24`}
      >
        <div className="self-end [grid-area:titre]">
          <p className="surtitre text-terracotta">{site.tagline.value}</p>
          <h1 id="hero" className="titre-hero mt-4 text-vert">
            Attiéké, braisé, kedjenou.
            <span className="block text-cacao">Les saveurs d&apos;Abidjan, à votre table.</span>
          </h1>
        </div>

        <div className="self-start [grid-area:texte]">
          <p className="max-w-lg text-lg leading-relaxed text-charbon/80 md:mt-6">
            Commandez en ligne, réservez votre table et découvrez nos plats sous tous les angles.
          </p>
          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href="/menu">Commander</ButtonLink>
            <ButtonLink href="/reservation" variant="secondary">
              Réserver une table
            </ButtonLink>
          </div>
          <Link
            href="/menu"
            className="group mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-vert underline decoration-orange decoration-2 underline-offset-[6px]"
          >
            Découvrir le menu
            <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* La table vue de dessus : l'assiette déborde du cadre et tourne lentement */}
        <div className="relative self-center [grid-area:visuel]">
          <div className="table-bois relative aspect-[16/11] overflow-hidden rounded-[2rem] md:aspect-[4/5] lg:aspect-square">
            <DishPlate
              name="Plat signature"
              photo={null}
              spin
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="absolute top-1/2 left-1/2 w-[78%] -translate-x-[42%] -translate-y-1/2 md:w-[95%] md:-translate-x-[38%]"
            />
          </div>
          <p className="mt-3 text-xs text-charbon/55">Visuel provisoire — la photographie officielle remplacera cette assiette.</p>
        </div>
      </div>
    </section>
  );
}

function InfosPratiques() {
  const wa = whatsappUrl();
  const card = "rounded-3xl bg-blanc p-6 sm:p-8";

  return (
    <section aria-labelledby="infos" className="py-16 sm:py-20 lg:py-28">
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="surtitre text-terracotta">Infos pratiques</p>
            <h2 id="infos" className="titre-section mt-3 text-vert">
              Venir nous voir
            </h2>
          </div>
          {site.address.placeholder && <Badge tone="provisoire">Coordonnées à venir</Badge>}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <div className={`${card} md:col-span-2 lg:col-span-1 lg:row-span-2`}>
            <IconPin className="text-terracotta" />
            <h3 className="mt-4 text-2xl text-charbon">Adresse</h3>
            <p className="mt-2 text-charbon/75">{site.address.value}</p>
            <div className="mt-6 grid aspect-[16/10] place-items-center rounded-2xl bg-sauge/25 text-center text-sm text-vert/70 lg:aspect-[4/5]">
              Carte interactive
              <br />
              (dès que l&apos;adresse est connue)
            </div>
          </div>

          <div className={card}>
            <IconClock className="text-terracotta" />
            <h3 className="mt-4 text-2xl text-charbon">Horaires</h3>
            <dl className="mt-3 space-y-2">
              {site.hours.value.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-sable pb-2 last:border-0">
                  <dt className="text-charbon/75">{h.days}</dt>
                  <dd className="font-bold text-charbon">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={card}>
            <IconPhone className="text-terracotta" />
            <h3 className="mt-4 text-2xl text-charbon">Contact</h3>
            <p className="mt-2 text-charbon/75">{site.phone.value}</p>
            <p className="text-charbon/75">{site.email.value}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {wa ? (
                <ButtonLink href={wa} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                  Écrire sur WhatsApp
                </ButtonLink>
              ) : (
                <ButtonLink href="/contact" variant="outline" size="sm">
                  Nous écrire
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
