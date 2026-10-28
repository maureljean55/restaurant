import Image from "next/image";
import Link from "next/link";
import { site, whatsappUrl } from "@/config/site";
import { demoAmbiance, findDemoDish } from "@/data/demo-dishes";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { DishCard } from "@/components/dish/DishCard";
import { Turntable } from "@/components/dish/Turntable";
import { IconArrow, IconBag, IconClock, IconPhone, IconPin, IconRotate } from "@/components/ui/icons";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

export default function HomePage() {
  const populaires = ["poisson-braise-attieke", "kedjenou-poulet", "riz-gras-poulet", "alloco"].map(findDemoDish);

  return (
    <>
      <Hero />

      {/* ───────── Plats populaires ───────── */}
      <section aria-labelledby="populaires" className="py-20 sm:py-24 lg:py-32">
        <div className={`${container} reveal flex flex-wrap items-end justify-between gap-6`}>
          <div className="max-w-xl">
            <p className="surtitre text-terracotta">La carte</p>
            <h2 id="populaires" className="titre-section mt-3 text-vert">
              Nos plats phares
            </h2>
            <p className="mt-4 text-charbon/70">
              Les classiques que l&apos;on commande les yeux fermés, du braisé au kedjenou.
            </p>
          </div>
          <Link href="/menu" className="group inline-flex min-h-11 items-center gap-2 font-bold text-vert">
            Voir tout le menu
            <span className="grid size-9 place-items-center rounded-full border border-vert/25 transition-colors group-hover:bg-vert group-hover:text-ivoire">
              <IconArrow width={16} height={16} />
            </span>
          </Link>
        </div>

        {/* Téléphone : défilement horizontal · Tablette : 2 colonnes · Ordinateur : 4 colonnes */}
        <ul
          className={`${container} mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-6 [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4`}
        >
          {populaires.map((dish) => (
            <li key={dish.slug} className="reveal w-[78%] shrink-0 snap-start xs:w-[72%] sm:w-[46%] md:w-auto">
              <DishCard dish={dish} />
            </li>
          ))}
        </ul>
      </section>

      <Concept />
      <Experience3D />
      <InfosPratiques />
    </>
  );
}

/* ═══════════════════════ Ouverture ═══════════════════════ */

function Hero() {
  return (
    <section
      aria-labelledby="hero"
      className="grain relative flex min-h-[92svh] items-end overflow-hidden bg-cacao text-ivoire lg:min-h-[100svh]"
    >
      <Image
        src={demoAmbiance.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="animate-zoom-lent object-cover object-[60%_50%]"
      />
      {/* Voiles pour la lisibilité : bas sombre (téléphone), gauche sombre (ordinateur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-cacao via-cacao/75 to-charbon/50 md:via-cacao/45 md:to-charbon/30" aria-hidden />
      <div className="absolute inset-0 bg-charbon/35 md:hidden" aria-hidden />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-charbon/75 via-charbon/25 to-transparent md:block" aria-hidden />

      <div className={`${container} relative w-full pt-32 pb-10 sm:pb-14 lg:pb-20`}>
        <div className="max-w-3xl">
          <p className="surtitre flex items-center gap-3 text-or">
            <span className="h-px w-8 bg-or" aria-hidden />
            {site.tagline.value}
          </p>
          <h1 id="hero" className="titre-hero mt-5">
            Attiéké, braisé, kedjenou.
            <span className="block text-sable/85">Les saveurs d&apos;Abidjan, à votre table.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivoire/80">
            Commandez en ligne, réservez votre table et découvrez nos plats sous tous les angles.
          </p>
          <div className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href="/menu" className="shadow-[0_10px_30px_-10px_rgb(245_130_32/0.7)]">
              <IconBag width={20} height={20} />
              Commander
            </ButtonLink>
            <ButtonLink href="/reservation" variant="outlineLight" className="verre !border-ivoire/30">
              Réserver une table
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 flex items-end justify-between gap-6 border-t border-ivoire/15 pt-5 text-sm">
          <Link href="/menu" className="group inline-flex items-center gap-3 font-semibold text-ivoire/85 hover:text-ivoire">
            <span className="grid size-10 place-items-center rounded-full border border-ivoire/30 transition-transform group-hover:translate-y-0.5">
              <IconArrow width={16} height={16} className="rotate-90" />
            </span>
            Découvrir le menu
          </Link>
          <p className="text-right text-xs text-ivoire/55">Photo d&apos;illustration</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ Le restaurant ═══════════════════════ */

function Concept() {
  return (
    <section aria-labelledby="concept" className="grain relative z-10 -mt-10 rounded-t-[2.5rem] lg:-mt-16 lg:rounded-t-[4rem] overflow-hidden bg-vert text-ivoire">
      <div className={`${container} grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:py-32`}>
        <div className="reveal relative lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={demoAmbiance.partage}
              alt="Une table garnie de poissons braisés et de plats à partager"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <span className="absolute top-4 left-5 text-[0.65rem] font-semibold text-ivoire/70">Photo d&apos;illustration</span>
        </div>

        <div className="reveal lg:col-span-6">
          <p className="surtitre text-or">Le restaurant</p>
          <h2 id="concept" className="titre-section mt-3">
            Une table pour partager les saveurs de Côte d&apos;Ivoire
          </h2>
          <div className="mt-8 rounded-2xl border border-dashed border-or/50 bg-ivoire/5 p-6 sm:p-8">
            <Badge tone="sable">Texte à fournir</Badge>
            <p className="mt-4 text-lg leading-relaxed text-ivoire/85">
              Ici : l&apos;histoire du restaurant, son équipe et ce qui fait sa cuisine. Quelques phrases sincères
              suffisent, avec une photo de la salle ou de l&apos;équipe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ 3D ═══════════════════════ */

function Experience3D() {
  const etapes = [
    ["Touchez « Voir en 3D »", "sur la fiche d'un plat qui porte le badge 3D."],
    ["Faites-le pivoter", "et zoomez du bout des doigts, sous tous les angles."],
    ["Touchez « Voir sur ma table »", "sur un téléphone compatible pour le poser chez vous, en réalité augmentée."],
  ];

  return (
    <section aria-labelledby="experience-3d" className="grain relative z-10 -mt-10 rounded-t-[2.5rem] lg:-mt-16 lg:rounded-t-[4rem] overflow-hidden bg-[#2a1913] text-ivoire">
      {/* Halo lumineux derrière le plateau */}
      <div className="pointer-events-none absolute top-1/2 right-[-10%] size-[70rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(245_130_32/0.18),transparent_60%)] max-md:top-[30%] max-md:right-1/2 max-md:size-[40rem] max-md:translate-x-1/2" aria-hidden />
      <div className={`${container} relative grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32`}>
        <div className="reveal relative mx-auto w-full max-w-[26rem] sm:max-w-xl lg:order-2">
          <Turntable
            centre={{ name: "Poisson braisé & attiéké", photo: "/demo/poisson-braise-alloco.jpg" }}
            autour={["kedjenou-poulet", "sauce-graine", "riz-gras-poulet", "alloco", "sauce-feuille-foutou"].map((slug) => {
              const d = findDemoDish(slug);
              return { name: d.name, photo: d.photo! };
            })}
          />
          <span className="verre absolute top-[6%] left-0 inline-flex animate-flotte items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
            <IconRotate width={18} height={18} className="text-or" /> 360°
          </span>
          <span className="absolute right-0 bottom-[14%] inline-flex animate-flotte items-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-bold text-charbon shadow-xl [animation-delay:-2.5s]">
            Voir sur ma table
          </span>
        </div>

        <div className="reveal">
          <p className="surtitre text-or">Expérience 3D</p>
          <h2 id="experience-3d" className="titre-section mt-3">
            Tournez autour du plat avant de commander
          </h2>
          <ol className="mt-10 space-y-6">
            {etapes.map(([titre, texte], i) => (
              <li key={titre} className="flex gap-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-or/15 font-display text-lg text-or ring-1 ring-or/40">
                  {i + 1}
                </span>
                <p className="pt-1.5 leading-relaxed text-ivoire/75">
                  <strong className="font-bold text-ivoire">{titre}</strong> {texte}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-l-2 border-or/50 pl-4 text-sm text-ivoire/60">
            Bientôt disponible pour une sélection de plats. Sur les appareils non compatibles, la photo reste
            affichée et la commande fonctionne toujours.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ Infos pratiques ═══════════════════════ */

function InfosPratiques() {
  const wa = whatsappUrl();
  const card = "reveal rounded-[1.75rem] bg-blanc p-6 sm:p-8 shadow-[0_20px_40px_-30px_rgb(74_46_36/0.5)]";

  return (
    <section aria-labelledby="infos" className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-ivoire py-20 sm:py-24 lg:-mt-16 lg:rounded-t-[4rem] lg:py-32">
      <div className={container}>
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="surtitre text-terracotta">Infos pratiques</p>
            <h2 id="infos" className="titre-section mt-3 text-vert">
              Venir nous voir
            </h2>
          </div>
          {site.address.placeholder && <Badge tone="provisoire">Coordonnées à venir</Badge>}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <div className={`${card} md:col-span-2 lg:col-span-1 lg:row-span-2`}>
            <span className="grid size-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta">
              <IconPin />
            </span>
            <h3 className="mt-5 text-2xl text-charbon">Adresse</h3>
            <p className="mt-2 text-charbon/70">{site.address.value}</p>
            <div className="relative mt-6 grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl bg-sauge/30 text-center text-sm text-vert/80 lg:aspect-[4/5]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(23_76_56/0.25)_1px,transparent_1px),linear-gradient(90deg,rgb(23_76_56/0.25)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden />
              <span className="relative">
                <IconPin className="mx-auto mb-2 text-terracotta" />
                Carte interactive
                <br />
                dès que l&apos;adresse est connue
              </span>
            </div>
          </div>

          <div className={card}>
            <span className="grid size-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta">
              <IconClock />
            </span>
            <h3 className="mt-5 text-2xl text-charbon">Horaires</h3>
            <dl className="mt-4 space-y-3">
              {site.hours.value.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-sable pb-3 last:border-0">
                  <dt className="text-charbon/70">{h.days}</dt>
                  <dd className="font-bold text-charbon">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={card}>
            <span className="grid size-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta">
              <IconPhone />
            </span>
            <h3 className="mt-5 text-2xl text-charbon">Contact</h3>
            <p className="mt-2 text-charbon/70">{site.phone.value}</p>
            <p className="text-charbon/70">{site.email.value}</p>
            <div className="mt-6 flex flex-wrap gap-3">
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

