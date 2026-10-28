import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { demoAmbiance, demoDishes } from "@/data/demo-dishes";
import { DishCard } from "@/components/dish/DishCard";
import { Turntable } from "@/components/dish/Turntable";
import { btn, pastille } from "@/components/ui/styles";
import { IconCalendar, IconCarte, IconChevron, IconCube, IconRotate, IconUsers, IconLeaf } from "@/components/ui/icons";

const container = "mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12";

export default function HomePage() {
  const signatures = [...demoDishes].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const avec3d = demoDishes.filter((d) => d.model && d.photo);

  return (
    <div className="flex flex-col gap-14 pb-16 md:gap-20 lg:gap-24 lg:pb-24">
      {/* ───────── Ouverture ───────── */}
      <section className={`${container} grid gap-5 pt-4 md:pt-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-12`}>
        <div className="relative overflow-hidden rounded-xl bg-creme-fonce shadow-flottant lg:order-2 lg:col-span-7">
          <div className="relative h-80 sm:h-[26rem] lg:h-[34rem]">
            <Image src={demoAmbiance.hero} alt="" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cacao/90 via-cacao/35 to-transparent lg:from-cacao/60" aria-hidden />
            <span className={`${pastille} absolute top-3 left-3 bg-ivoire/90 text-vert uppercase shadow-sm backdrop-blur-md`}>
              <span className="size-2 animate-pulse rounded-full bg-orange" />
              Gastronomie ivoirienne
            </span>
            <span className="absolute right-3 bottom-3 text-[0.65rem] text-ivoire/70">Photo d&apos;illustration</span>
            {/* Téléphone/tablette : titre sur la photo, comme la maquette */}
            <div className="absolute inset-x-4 bottom-8 text-ivoire lg:hidden">
              <p className="surtitre text-or-pale">{site.tagline.value}</p>
              <h1 className="mt-1.5 max-w-md text-headline-lg-mobile sm:text-headline-lg">
                Découvrez l&apos;âme de la cuisine <em className="font-medium">ivoirienne</em>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="hidden lg:block">
            <p className="surtitre text-terracotta">{site.tagline.value}</p>
            <h1 className="mt-3 text-display text-vert">
              Découvrez l&apos;âme de la cuisine <em className="font-medium text-cacao">ivoirienne</em>
            </h1>
          </div>
          <p className="text-body-md text-cacao/80 lg:text-body-lg">
            Des saveurs authentiques et des recettes transmises, servies dans un cadre moderne à Abidjan. Commandez
            en ligne, réservez votre table et découvrez nos plats sous tous les angles.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <Link href="/menu" className={`${btn.primary} ${btn.md} px-4`}>
              <IconCarte width={18} height={18} />
              La carte
            </Link>
            <Link href="/reservation" className={`${btn.secondary} ${btn.md} px-4`}>
              <IconCalendar width={18} height={18} />
              Réserver
            </Link>
          </div>
          {/* Indicateurs : uniquement des faits vrais sur le service proposé */}
          <dl className="grid grid-cols-3 gap-2 rounded-xl bg-creme p-3 text-center sm:p-4">
            {[
              ["En ligne", "Commande & réservation", "text-vert"],
              ["360°", "Aperçu 3D & RA", "text-terracotta"],
              ["Abidjan", "Côte d'Ivoire", "text-vert"],
            ].map(([valeur, libelle, couleur]) => (
              <div key={valeur} className="flex flex-col-reverse items-center">
                <dt className="text-label-sm font-medium text-cacao/65">{libelle}</dt>
                <dd className={`font-display text-headline-sm ${couleur}`}>{valeur}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Plats signatures ───────── */}
      <section aria-labelledby="signatures" className={container}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="surtitre text-terracotta">Créations emblématiques</p>
            <h2 id="signatures" className="mt-1 text-headline-sm text-cacao md:text-headline-md">
              Nos plats signatures
            </h2>
          </div>
          <Link href="/menu" className="flex items-center gap-0.5 text-label-md text-vert hover:text-terracotta">
            Voir tout <IconChevron width={16} height={16} />
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {signatures.map((dish) => (
            <li key={dish.slug}>
              <DishCard dish={dish} variant="signature" />
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Encart 3D & réalité augmentée ───────── */}
      <section aria-labelledby="teaser-3d" className={container}>
        <div className="relative grid overflow-hidden rounded-2xl bg-vert text-ivoire shadow-flottant md:grid-cols-2 md:items-center">
          <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-orange/20 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-3 p-6 sm:p-8 lg:p-12">
            <span className={`${pastille} self-start bg-ivoire/15 text-vert-pale uppercase backdrop-blur-md`}>
              <IconCube width={15} height={15} />
              Immersion réalité augmentée
            </span>
            <h2 id="teaser-3d" className="text-headline-sm sm:text-headline-md lg:text-headline-lg">
              Vivez votre assiette en 360° &amp; RA avant de commander
            </h2>
            <p className="text-body-sm text-ivoire/75 sm:text-body-md">
              Faites pivoter les plats, zoomez sur les textures et, sur un téléphone compatible, posez-les sur votre
              table en réalité augmentée.
            </p>
            <div className="pt-2">
              <Link href="/experience-3d" className={`${btn.primary} ${btn.md}`}>
                <IconRotate width={18} height={18} />
                Lancer l&apos;expérience 3D
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm px-6 pb-8 md:max-w-md md:py-8">
            <Turntable
              centre={{ name: avec3d[0].name, photo: avec3d[0].photo! }}
              autour={demoDishes.filter((d) => d.photo && d.slug !== avec3d[0].slug).slice(0, 5).map((d) => ({ name: d.name, photo: d.photo! }))}
            />
          </div>
        </div>
      </section>

      {/* ───────── Terroir & modernité ───────── */}
      <section aria-labelledby="terroir" className={container}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="surtitre text-terracotta">Philosophie</p>
            <h2 id="terroir" className="mt-1 text-headline-sm text-cacao md:text-headline-md">
              Terroir &amp; modernité
            </h2>
          </div>
          <span className={`${pastille} border border-dashed border-terracotta text-terracotta`}>Textes à fournir</span>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4 lg:gap-6">
          <div className="relative h-56 overflow-hidden rounded-xl shadow-carte md:col-span-2 md:row-span-2 md:h-auto md:min-h-80">
            <Image src={demoAmbiance.partage} alt="Une table garnie de plats à partager" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cacao/85 via-cacao/25 to-transparent" aria-hidden />
            <div className="absolute inset-x-4 bottom-4 text-ivoire md:inset-x-6 md:bottom-6">
              <h3 className="text-title md:text-headline-sm">L&apos;art du partage</h3>
              <p className="mt-1 max-w-md text-body-sm text-ivoire/80">
                Ici : l&apos;histoire du restaurant, son équipe et ce qui fait sa cuisine.
              </p>
            </div>
            <span className="absolute top-3 left-3 text-[0.65rem] text-ivoire/75">Photo d&apos;illustration</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:contents">
            {[
              { Icon: IconLeaf, titre: "Produits & savoir-faire", texte: "Vos producteurs, vos recettes, votre façon de cuisiner.", couleur: "text-vert bg-vert/10" },
              { Icon: IconUsers, titre: "L'hospitalité Akwaba", texte: "L'accueil à l'ivoirienne : chaleureux, attentif, généreux.", couleur: "text-terracotta bg-terracotta/10" },
            ].map(({ Icon, titre, texte, couleur }) => (
              <div key={titre} className="flex flex-col justify-between gap-3 rounded-xl bg-creme p-4 shadow-carte md:p-6">
                <span className={`grid size-10 place-items-center rounded-full ${couleur}`}>
                  <Icon width={20} height={20} />
                </span>
                <div>
                  <h3 className="text-title text-vert">{titre}</h3>
                  <p className="mt-1 text-body-sm text-cacao/75">{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Appel à réserver ───────── */}
      <section className={container}>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-sable/70 bg-creme-fonce px-6 py-10 text-center shadow-carte md:py-14">
          <span className="grid size-12 place-items-center rounded-full bg-orange text-charbon shadow-carte">
            <IconCalendar />
          </span>
          <div className="max-w-md">
            <p className="surtitre text-terracotta">Une table chez nous</p>
            <h2 className="mt-1 text-headline-sm text-cacao md:text-headline-md">Préparez votre prochaine soirée</h2>
            <p className="mt-2 text-body-sm text-cacao/75">
              Choisissez la date, l&apos;heure et le nombre de convives : le restaurant confirme selon les places
              disponibles.
            </p>
          </div>
          <Link href="/reservation" className={`${btn.primary} ${btn.md} w-full sm:w-auto`}>
            <IconCalendar width={18} height={18} />
            Réserver votre table
          </Link>
        </div>
      </section>
    </div>
  );
}
